from rest_framework import serializers

from .models import ChatChannel, ChatMessage


class ChatChannelSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True
    )

    class Meta:
        model = ChatChannel
        fields = [
            "id",
            "name",
            "created_by",
            "created_by_username",
            "created_at",
        ]
        read_only_fields = ["created_by", "created_at"]


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(
        source="sender.username", read_only=True
    )

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "channel",
            "sender",
            "sender_username",
            "text",
            "attachment",
            "created_at",
        ]
        read_only_fields = ["sender", "channel", "created_at"]
