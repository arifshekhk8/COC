from django.urls import path

from . import views

urlpatterns = [
    path("clan/", views.ClanView.as_view(), name="coc-clan"),
    path("clan/members/", views.ClanMembersView.as_view(), name="coc-clan-members"),
    path(
        "players/<str:player_tag>/",
        views.PlayerView.as_view(),
        name="coc-player",
    ),
]
