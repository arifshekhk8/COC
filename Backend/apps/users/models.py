from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    """
    Extends Django's built-in User with Google OAuth fields.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    google_sub = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
        help_text="Google 'sub' claim (unique user identifier)",
    )
    avatar_url = models.URLField(max_length=500, blank=True, default="")
    full_name = models.CharField(max_length=255, blank=True, default="")

    def __str__(self):
        return f"Profile({self.user.username}, sub={self.google_sub})"
