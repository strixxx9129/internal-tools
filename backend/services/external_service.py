"""External API integration (JSONPlaceholder demo directory).

Demonstrates: outbound HTTP requests, timeouts, error mapping,
response transformation and a short TTL cache to respect rate limits.
"""
import time

import httpx
from fastapi import HTTPException, status

from config import get_settings
from schemas.external import ExternalUser, ExternalUsersResponse
from utils.time import utcnow

settings = get_settings()

_cache: dict = {"payload": None, "expires_at": 0.0}


def fetch_users() -> ExternalUsersResponse:
    now = time.time()
    if _cache["payload"] is not None and now < _cache["expires_at"]:
        cached: ExternalUsersResponse = _cache["payload"]
        return cached.model_copy(update={"cached": True})

    try:
        with httpx.Client(
            base_url=settings.EXTERNAL_API_BASE_URL,
            timeout=settings.EXTERNAL_API_TIMEOUT_SECONDS,
        ) as client:
            response = client.get("/users")
            response.raise_for_status()
    except httpx.TimeoutException:
        raise HTTPException(
            status.HTTP_504_GATEWAY_TIMEOUT, "External API request timed out"
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            f"External API returned status {exc.response.status_code}",
        )
    except httpx.HTTPError:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY, "Could not reach the external API"
        )

    users = [
        ExternalUser(
            id=item["id"],
            name=item["name"],
            username=item["username"],
            email=item["email"],
            company=item.get("company", {}).get("name", ""),
            website=item.get("website", ""),
            city=item.get("address", {}).get("city", ""),
        )
        for item in response.json()
    ]

    payload = ExternalUsersResponse(
        source=settings.EXTERNAL_API_BASE_URL,
        count=len(users),
        cached=False,
        fetched_at=utcnow(),
        data=users,
    )
    _cache["payload"] = payload
    _cache["expires_at"] = now + settings.EXTERNAL_CACHE_TTL_SECONDS
    return payload
