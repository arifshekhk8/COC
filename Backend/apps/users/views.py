import logging

from django.conf import settings
from django.contrib.auth.models import User
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile
from .serializers import GoogleLoginSerializer, UserSerializer

logger = logging.getLogger(__name__)

GOOGLE_CLIENT_ID = getattr(settings, "GOOGLE_CLIENT_ID", "")


def _user_payload(user: User) -> dict:
    """Build the user dict for the login response."""
    profile = getattr(user, "profile", None)
    return {
        "id": user.id,
        "email": user.email,
        "full_name": profile.full_name if profile else "",
        "avatar_url": profile.avatar_url if profile else "",
        "date_joined": user.date_joined.isoformat(),
    }


class GoogleLoginView(APIView):
    """Verify Google ID token → create/lookup user → issue JWT."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = GoogleLoginSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        raw_token = ser.validated_data["id_token"]

        # ── 1. Verify Google ID token ──────────────────────────────
        try:
            idinfo = google_id_token.verify_oauth2_token(
                raw_token,
                google_requests.Request(),
                GOOGLE_CLIENT_ID,
            )
        except ValueError as exc:
            logger.warning("Google token verification failed: %s", exc)
            return Response(
                {"detail": "Invalid Google token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # ── 2. Validate claims ─────────────────────────────────────
        iss = idinfo.get("iss", "")
        if iss not in ("accounts.google.com", "https://accounts.google.com"):
            return Response(
                {"detail": "Invalid token issuer."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not idinfo.get("email_verified", False):
            return Response(
                {"detail": "Google email not verified."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # ── 3. Extract identity ────────────────────────────────────
        sub = idinfo["sub"]
        email = idinfo["email"]
        name = idinfo.get("name", "")
        picture = idinfo.get("picture", "")

        # ── 4. Create / lookup user ────────────────────────────────
        # Case A: profile with this google_sub already exists
        try:
            profile = UserProfile.objects.select_related("user").get(
                google_sub=sub
            )
            user = profile.user
            # Update name / avatar on every login
            changed = False
            if name and profile.full_name != name:
                profile.full_name = name
                changed = True
            if picture and profile.avatar_url != picture:
                profile.avatar_url = picture
                changed = True
            if changed:
                profile.save(update_fields=["full_name", "avatar_url"])
        except UserProfile.DoesNotExist:
            # Case B: user with same email exists, no google_sub yet
            try:
                user = User.objects.get(email=email)
                # Check if this user already has a DIFFERENT google_sub
                if hasattr(user, "profile"):
                    return Response(
                        {
                            "detail": (
                                "This email is already linked to a different "
                                "Google account."
                            )
                        },
                        status=status.HTTP_409_CONFLICT,
                    )
                # Attach google_sub to existing user
                user.set_unusable_password()
                user.save(update_fields=["password"])
                UserProfile.objects.create(
                    user=user,
                    google_sub=sub,
                    full_name=name,
                    avatar_url=picture,
                )
            except User.DoesNotExist:
                # Case C: brand-new user
                username = email.split("@")[0]
                # Ensure unique username
                base = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base}{counter}"
                    counter += 1
                user = User.objects.create_user(
                    username=username,
                    email=email,
                )
                user.set_unusable_password()
                user.save(update_fields=["password"])
                UserProfile.objects.create(
                    user=user,
                    google_sub=sub,
                    full_name=name,
                    avatar_url=picture,
                )

        # ── 5. Issue JWT via SimpleJWT ─────────────────────────────
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": _user_payload(user),
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(_user_payload(request.user))
