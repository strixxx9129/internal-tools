from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from schemas.user import UserResponse


class CommentCreate(BaseModel):
    comment: str = Field(min_length=1, max_length=2000)


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    comment: str
    created_at: datetime
    user: Optional[UserResponse] = None
