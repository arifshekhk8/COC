from django.contrib import admin

from .models import ChatChannel, ChatMessage


@admin.register(ChatChannel)
class ChatChannelAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "created_by", "created_at"]
    search_fields = ["name"]


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ["id", "channel", "sender", "text_preview", "created_at"]
    list_filter = ["channel"]
    search_fields = ["text"]

    @admin.display(description="Text")
    def text_preview(self, obj):
        return obj.text[:80]
