from django.urls import path

from . import views

urlpatterns = [
    path(
        "channels/",
        views.ChatChannelListCreateView.as_view(),
        name="channel-list-create",
    ),
    path(
        "channels/<int:channel_id>/messages/",
        views.ChatMessageListCreateView.as_view(),
        name="message-list-create",
    ),
]
