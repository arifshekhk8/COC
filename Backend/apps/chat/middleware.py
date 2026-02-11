"""
JWT authentication middleware for Django Channels WebSocket connections.

Authenticates via query-string: ws://…/ws/chat/1/?token=<access_token>
"""

from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


@database_sync_to_async
def get_user_from_token(token_string: str):
    try:
        validated = AccessToken(token_string)
        return User.objects.get(id=validated["user_id"])
    except Exception:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        qs = scope.get("query_string", b"").decode()
        params = parse_qs(qs)
        token = params.get("token", [None])[0]

        scope["user"] = (
            await get_user_from_token(token) if token else AnonymousUser()
        )
        return await super().__call__(scope, receive, send)
