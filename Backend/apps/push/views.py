from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import PushSubscription
from .serializers import PushSubscriptionSerializer


class PushSubscribeView(generics.CreateAPIView):
    serializer_class = PushSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Upsert: remove prior subscription with same endpoint for this user.
        PushSubscription.objects.filter(
            user=self.request.user,
            endpoint=serializer.validated_data["endpoint"],
        ).delete()
        serializer.save(user=self.request.user)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def push_test(request):
    """
    Stub endpoint for testing push notifications.
    In production, use pywebpush + VAPID keys to actually send a push.
    Requirements: pip install pywebpush, VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY in .env
    """
    sub = PushSubscription.objects.filter(user=request.user).first()
    if not sub:
        return Response(
            {"detail": "No push subscription found. Subscribe first."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return Response(
        {
            "detail": "Test notification would be sent here.",
            "subscription_endpoint": sub.endpoint,
            "note": "Install pywebpush and configure VAPID keys for real push.",
        }
    )
