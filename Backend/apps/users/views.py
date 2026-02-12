from django.conf import settings
from django.contrib.auth.models import User
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile
from .serializers import UserSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Accept a Google ID token (``credential``), verify it,
    get-or-create a Django user, and return JWT tokens + profile.
    """
    credential = request.data.get("credential")
    if not credential:
        return Response(
            {"error": "Missing credential"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError:
        return Response(
            {"error": "Invalid Google token"}, status=status.HTTP_401_UNAUTHORIZED
        )

    email = idinfo.get("email")
    if not email:
        return Response(
            {"error": "Email not available from Google"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Get-or-create user by email
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "username": email,
            "first_name": idinfo.get("given_name", ""),
            "last_name": idinfo.get("family_name", ""),
        },
    )

    if not created:
        user.first_name = idinfo.get("given_name", "") or user.first_name
        user.last_name = idinfo.get("family_name", "") or user.last_name
        user.save(update_fields=["first_name", "last_name"])

    # Update profile with Google-specific fields
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.google_sub = idinfo.get("sub", "")
    profile.avatar_url = idinfo.get("picture", "")
    profile.save(update_fields=["google_sub", "avatar_url"])

    # Issue JWT
    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.get_full_name() or user.username,
                "picture": profile.avatar_url,
            },
        }
    )


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
