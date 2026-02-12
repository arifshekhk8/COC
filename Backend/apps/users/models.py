from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    """Stores Google OAuth fields alongside Django's built-in User."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    google_sub = models.CharField(max_length=255, blank=True, default="")
    avatar_url = models.URLField(max_length=500, blank=True, default="")

    def __str__(self) -> str:
        return f"Profile({self.user.username})"
