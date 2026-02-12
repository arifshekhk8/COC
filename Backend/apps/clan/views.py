import logging

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .client import CocApiError, fetch_clan, fetch_clan_members, fetch_player

logger = logging.getLogger(__name__)


def _handle_coc_error(exc: CocApiError) -> Response:
    """Map a CocApiError to a DRF Response with appropriate status."""
    # Map upstream status codes to what we return to our frontend
    status_map = {
        400: status.HTTP_400_BAD_REQUEST,
        403: status.HTTP_502_BAD_GATEWAY,
        404: status.HTTP_404_NOT_FOUND,
        429: status.HTTP_429_TOO_MANY_REQUESTS,
        502: status.HTTP_502_BAD_GATEWAY,
    }
    http_status = status_map.get(exc.status_code, status.HTTP_502_BAD_GATEWAY)
    return Response(
        {"detail": exc.reason, "upstream_detail": exc.detail},
        status=http_status,
    )


class ClanView(APIView):
    """GET /api/coc/clan — fetch default clan info."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = fetch_clan()
        except CocApiError as exc:
            return _handle_coc_error(exc)

        # Shape the response for the frontend
        payload = {
            "tag": data.get("tag"),
            "name": data.get("name"),
            "badgeUrls": data.get("badgeUrls"),
            "type": data.get("type"),
            "description": data.get("description", ""),
            "location": data.get("location"),
            "clanLevel": data.get("clanLevel"),
            "members": data.get("members"),
            "clanPoints": data.get("clanPoints"),
            "clanBuilderBasePoints": data.get("clanBuilderBasePoints"),
            "warLeague": data.get("warLeague"),
            "warWins": data.get("warWins"),
            "warWinStreak": data.get("warWinStreak"),
            "isWarLogPublic": data.get("isWarLogPublic"),
            "clanCapital": data.get("clanCapital"),
            "capitalLeague": data.get("capitalLeague"),
            "clanCapitalPoints": data.get("clanCapitalPoints"),
            "labels": data.get("labels", []),
            "isFamilyFriendly": data.get("isFamilyFriendly"),
        }
        return Response(payload)


class ClanMembersView(APIView):
    """GET /api/coc/clan/members — fetch default clan's member list."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            items = fetch_clan_members()
        except CocApiError as exc:
            return _handle_coc_error(exc)

        members = []
        for m in items:
            members.append(
                {
                    "name": m.get("name"),
                    "tag": m.get("tag"),
                    "role": m.get("role"),
                    "expLevel": m.get("expLevel"),
                    "townHallLevel": m.get("townHallLevel"),
                    "league": m.get("league"),
                    "builderBaseLeague": m.get("builderBaseLeague"),
                    "trophies": m.get("trophies"),
                    "builderBaseTrophies": m.get("builderBaseTrophies"),
                    "clanRank": m.get("clanRank"),
                    "previousClanRank": m.get("previousClanRank"),
                    "donations": m.get("donations"),
                    "donationsReceived": m.get("donationsReceived"),
                }
            )
        return Response(members)


class PlayerView(APIView):
    """GET /api/coc/players/<playerTag> — fetch player profile."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, player_tag: str):
        # Re-add '#' prefix if not present (frontend strips it for URL safety)
        if not player_tag.startswith("#"):
            player_tag = f"#{player_tag}"

        try:
            data = fetch_player(player_tag)
        except CocApiError as exc:
            return _handle_coc_error(exc)

        payload = {
            "tag": data.get("tag"),
            "name": data.get("name"),
            "townHallLevel": data.get("townHallLevel"),
            "townHallWeaponLevel": data.get("townHallWeaponLevel"),
            "expLevel": data.get("expLevel"),
            "trophies": data.get("trophies"),
            "bestTrophies": data.get("bestTrophies"),
            "warStars": data.get("warStars"),
            "attackWins": data.get("attackWins"),
            "defenseWins": data.get("defenseWins"),
            "builderHallLevel": data.get("builderHallLevel"),
            "builderBaseTrophies": data.get("builderBaseTrophies"),
            "bestBuilderBaseTrophies": data.get("bestBuilderBaseTrophies"),
            "league": data.get("league"),
            "builderBaseLeague": data.get("builderBaseLeague"),
            "clan": data.get("clan"),
            "role": data.get("role"),
            "warPreference": data.get("warPreference"),
            "donations": data.get("donations"),
            "donationsReceived": data.get("donationsReceived"),
            "clanCapitalContributions": data.get("clanCapitalContributions"),
            "labels": data.get("labels", []),
            "heroes": data.get("heroes", []),
            "troops": data.get("troops", []),
            "spells": data.get("spells", []),
            "heroEquipment": data.get("heroEquipment", []),
            "legendStatistics": data.get("legendStatistics"),
            "achievements": data.get("achievements", []),
        }
        return Response(payload)
