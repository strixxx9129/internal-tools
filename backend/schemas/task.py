from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from schemas.activity import ActivityResponse
from schemas.comment import CommentResponse
from schemas.user import UserResponse

TaskStatus = Literal["pending", "in_progress", "completed", "blocked"]
TaskPriority = Literal["low", "medium", "high", "urgent"]


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    status: TaskStatus = "pending"
    priority: TaskPriority = "medium"
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    status: str
    priority: str
    assigned_to: Optional[int]
    created_by: Optional[int]
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    assignee: Optional[UserResponse] = None
    creator: Optional[UserResponse] = None


class TaskDetailResponse(TaskResponse):
    comments: list[CommentResponse] = []
    activities: list[ActivityResponse] = []


class TaskListResponse(BaseModel):
    items: list[TaskResponse]
    total: int
    page: int
    limit: int
    pages: int
