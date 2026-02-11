"""
Placeholder models for future Clash of Clans clan features.
"""

from django.conf import settings
from django.db import models


class Clan(models.Model):
    name = models.CharField(max_length=255)
    tag = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_clans",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ClanMember(models.Model):
    class Role(models.TextChoices):
        LEADER = "leader", "Leader"
        CO_LEADER = "co_leader", "Co-Leader"
        ELDER = "elder", "Elder"
        MEMBER = "member", "Member"

    clan = models.ForeignKey(
        Clan, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="clan_memberships",
    )
    role = models.CharField(
        max_length=20, choices=Role.choices, default=Role.MEMBER)
    war_opt_in = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["clan", "user"]

    def __str__(self):
        return f"{self.user.username} ({self.clan.name})"


class Hero(models.Model):
    """Placeholder: track hero levels per member."""

    member = models.ForeignKey(
        ClanMember, on_delete=models.CASCADE, related_name="heroes")
    name = models.CharField(max_length=100)
    level = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.name} Lv{self.level}"


class Troop(models.Model):
    """Placeholder: track troop levels per member."""

    member = models.ForeignKey(
        ClanMember, on_delete=models.CASCADE, related_name="troops")
    name = models.CharField(max_length=100)
    level = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.name} Lv{self.level}"


class Defense(models.Model):
    """Placeholder: track defense levels per member."""

    member = models.ForeignKey(
        ClanMember, on_delete=models.CASCADE, related_name="defenses")
    name = models.CharField(max_length=100)
    level = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.name} Lv{self.level}"
