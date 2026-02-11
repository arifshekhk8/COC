from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from .models import ChatChannel, ChatMessage


class ChatConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for real-time chat.

    Connect: ws://host/ws/chat/<channel_id>/?token=<jwt>
    Send:    {"type": "chat.message", "text": "Hello!"}
    Receive: {"id": 1, "text": "Hello!", "sender": {"id": 1, "username": "alice"}, "created_at": "..."}
    """

    async def connect(self):
        self.channel_id = self.scope["url_route"]["kwargs"]["channel_id"]
        self.room_group = f"chat_{self.channel_id}"
        self.user = self.scope.get("user")

        if not self.user or self.user.is_anonymous:
            await self.close(code=4001)
            return

        await self.channel_layer.group_add(self.room_group, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group"):
            await self.channel_layer.group_discard(
                self.room_group, self.channel_name
            )

    async def receive_json(self, content, **kwargs):
        text = content.get("text", "").strip()
        if not text:
            return

        message = await self.save_message(text)

        await self.channel_layer.group_send(
            self.room_group,
            {"type": "chat_message", "message": message},
        )

    async def chat_message(self, event):
        await self.send_json(event["message"])

    @database_sync_to_async
    def save_message(self, text: str) -> dict:
        channel = ChatChannel.objects.get(id=self.channel_id)
        msg = ChatMessage.objects.create(
            channel=channel,
            sender=self.user,
            text=text,
        )
        return {
            "id": msg.id,
            "text": msg.text,
            "sender": {
                "id": msg.sender.id,
                "username": msg.sender.username,
            },
            "created_at": msg.created_at.isoformat(),
        }
