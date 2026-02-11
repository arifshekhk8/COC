from django.contrib import admin

from .models import Clan, ClanMember, Defense, Hero, Troop


@admin.register(Clan)
class ClanAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "tag", "created_by", "created_at"]


@admin.register(ClanMember)
class ClanMemberAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "clan", "role", "war_opt_in"]


@admin.register(Hero)
class HeroAdmin(admin.ModelAdmin):
    list_display = ["id", "member", "name", "level"]


@admin.register(Troop)
class TroopAdmin(admin.ModelAdmin):
    list_display = ["id", "member", "name", "level"]


@admin.register(Defense)
class DefenseAdmin(admin.ModelAdmin):
    list_display = ["id", "member", "name", "level"]
