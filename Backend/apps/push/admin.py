from django.contrib import admin

from .models import PushSubscription


@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "endpoint_short", "created_at"]
    list_filter = ["user"]

    @admin.display(description="Endpoint")
    def endpoint_short(self, obj):
        return obj.endpoint[:80]
