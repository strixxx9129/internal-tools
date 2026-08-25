from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from schemas.user import UserResponse


class ActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    action: str
    detail: str
    created_at: datetime
    user: Optional[UserResponse] = None
