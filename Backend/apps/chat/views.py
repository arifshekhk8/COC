from rest_framework import generics, permissions
from rest_framework.pagination import CursorPagination

from .models import ChatChannel, ChatMessage
from .serializers import ChatChannelSerializer, ChatMessageSerializer


class MessageCursorPagination(CursorPagination):
    page_size = 50
    ordering = "-created_at"
    cursor_query_param = "cursor"


class ChatChannelListCreateView(generics.ListCreateAPIView):
    queryset = ChatChannel.objects.select_related("created_by").all()
    serializer_class = ChatChannelSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # channels are few, no need to paginate

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ChatMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MessageCursorPagination

    def get_queryset(self):
        return (
            ChatMessage.objects.filter(channel_id=self.kwargs["channel_id"])
            .select_related("sender")
        )

    def perform_create(self, serializer):
        serializer.save(
            sender=self.request.user,
            channel_id=self.kwargs["channel_id"],
        )
