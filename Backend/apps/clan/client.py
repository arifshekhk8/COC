"""
Thin HTTP client for the official Clash of Clans API.

Reads config from Django settings / env vars:
  - COC_DEV_API_TOKEN  (required)
  - COC_BASE_URL       (default: https://cocproxy.royaleapi.dev/v1)
  - COC_DEFAULT_CLAN_TAG (required for /clan endpoints)

All responses are cached server-side with Django's cache framework
to avoid hammering the upstream API.
"""

import logging
import time
import urllib.parse
from typing import Any

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

_TOKEN: str = getattr(settings, "COC_DEV_API_TOKEN", "")
_BASE_URL: str = getattr(
    settings, "COC_BASE_URL", "https://cocproxy.royaleapi.dev/v1"
)
_DEFAULT_CLAN_TAG: str = getattr(settings, "COC_DEFAULT_CLAN_TAG", "")

# ── Simple in-memory cache ────────────────────────────────────────────
_cache: dict[str, tuple[float, Any]] = {}


def _get_cached(key: str, ttl: float) -> Any | None:
    entry = _cache.get(key)
    if entry and (time.time() - entry[0]) < ttl:
        return entry[1]
    return None


def _set_cached(key: str, value: Any) -> None:
    _cache[key] = (time.time(), value)


# ── Helpers ───────────────────────────────────────────────────────────
def encode_tag(tag: str) -> str:
    """URL-encode a CoC tag (e.g. '#ABC' -> '%23ABC')."""
    return urllib.parse.quote(tag, safe="")


def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {_TOKEN}",
        "Accept": "application/json",
    }


class CocApiError(Exception):
    """Raised when upstream CoC API returns a non-2xx status."""

    def __init__(self, status_code: int, reason: str, detail: str = ""):
        self.status_code = status_code
        self.reason = reason
        self.detail = detail
        super().__init__(f"CoC API {status_code}: {reason}")


def _request(path: str, params: dict | None = None) -> Any:
    """Make a GET request to the CoC API."""
    url = f"{_BASE_URL}{path}"
    try:
        resp = requests.get(url, headers=_headers(), params=params, timeout=10)
    except requests.RequestException as exc:
        logger.error("CoC API request failed: %s", exc)
        raise CocApiError(502, "Upstream API unreachable") from exc

    if resp.status_code == 200:
        return resp.json()

    # Map upstream errors to friendly messages
    reason_map = {
        400: "Bad request to CoC API",
        403: "CoC API access denied — check your token / IP whitelist",
        404: "Tag not found in CoC API",
        429: "CoC API rate limit exceeded — try again later",
        500: "CoC API internal error",
        503: "CoC API under maintenance",
    }
    reason = reason_map.get(
        resp.status_code, f"Upstream error {resp.status_code}")
    detail = ""
    try:
        detail = resp.json().get("message", "")
    except Exception:
        pass
    raise CocApiError(resp.status_code, reason, detail)


# ── Public API ────────────────────────────────────────────────────────
def fetch_clan(tag: str | None = None, cache_ttl: float = 45) -> dict:
    """Fetch clan info. Uses default tag if none provided."""
    tag = tag or _DEFAULT_CLAN_TAG
    if not tag:
        raise CocApiError(400, "No clan tag configured")

    cache_key = f"clan:{tag}"
    cached = _get_cached(cache_key, cache_ttl)
    if cached is not None:
        return cached

    data = _request(f"/clans/{encode_tag(tag)}")
    _set_cached(cache_key, data)
    return data


def fetch_clan_members(
    tag: str | None = None, limit: int = 50, cache_ttl: float = 45
) -> list[dict]:
    """Fetch clan members list. Uses default tag if none provided."""
    tag = tag or _DEFAULT_CLAN_TAG
    if not tag:
        raise CocApiError(400, "No clan tag configured")

    cache_key = f"clan_members:{tag}:{limit}"
    cached = _get_cached(cache_key, cache_ttl)
    if cached is not None:
        return cached

    data = _request(f"/clans/{encode_tag(tag)}/members",
                    params={"limit": limit})
    items = data.get("items", [])
    _set_cached(cache_key, items)
    return items


def fetch_player(tag: str, cache_ttl: float = 90) -> dict:
    """Fetch a player's full profile."""
    if not tag:
        raise CocApiError(400, "Player tag is required")

    cache_key = f"player:{tag}"
    cached = _get_cached(cache_key, cache_ttl)
    if cached is not None:
        return cached

    data = _request(f"/players/{encode_tag(tag)}")
    _set_cached(cache_key, data)
    return data
