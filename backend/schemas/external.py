from datetime import datetime

from pydantic import BaseModel


class ExternalUser(BaseModel):
    id: int
    name: str
    username: str
    email: str
    company: str
    website: str
    city: str


class ExternalUsersResponse(BaseModel):
    source: str
    count: int
    cached: bool
    fetched_at: datetime
    data: list[ExternalUser]
