from django.contrib import admin

from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "google_sub", "full_name"]
    search_fields = ["user__username",
                     "user__email", "google_sub", "full_name"]
    raw_id_fields = ["user"]
