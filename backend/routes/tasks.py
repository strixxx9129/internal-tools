from math import ceil
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from repositories import comment_repository, task_repository
from schemas.comment import CommentCreate, CommentResponse
from schemas.task import (
    TaskCreate,
    TaskDetailResponse,
    TaskListResponse,
    TaskPriority,
    TaskResponse,
    TaskStatus,
    TaskUpdate,
)
from services import task_service
from utils.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=TaskListResponse)
def list_tasks(
    task_status: Optional[TaskStatus] = Query(None, alias="status"),
    priority: Optional[TaskPriority] = None,
    assignee: Optional[int] = None,
    search: Optional[str] = Query(None, max_length=100),
    sort_by: str = "created_at",
    sort_dir: Literal["asc", "desc"] = "desc",
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List tasks with backend filtering, search, sorting and pagination.

    Examples: /api/tasks?status=in_progress&priority=high&assignee=2&search=shopify&page=1&limit=20
    """
    if sort_by not in task_repository.SORTABLE_COLUMNS:
        allowed = ", ".join(sorted(task_repository.SORTABLE_COLUMNS))
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, f"Invalid sort_by '{sort_by}'. Allowed: {allowed}"
        )
    items, total = task_repository.list_tasks(
        db,
        status=task_status,
        priority=priority,
        assignee=assignee,
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir,
        page=page,
        limit=limit,
    )
    return TaskListResponse(
        items=items, total=total, page=page, limit=limit, pages=max(1, ceil(total / limit))
    )


@router.get("/{task_id}", response_model=TaskDetailResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = task_repository.get_by_id(db, task_id)
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    return task


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return task_service.create_task(db, payload, current_user)


@router.put("/{task_id}", response_model=TaskDetailResponse)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return task_service.update_task(db, task_id, payload, current_user)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "manager")),
):
    task_service.delete_task(db, task_id, current_user)


@router.get("/{task_id}/comments", response_model=list[CommentResponse])
def list_comments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if task_repository.get_by_id(db, task_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    return comment_repository.list_for_task(db, task_id)


@router.post(
    "/{task_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_comment(
    task_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return task_service.add_comment(db, task_id, payload, current_user)


@router.delete("/{task_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    task_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = comment_repository.get_by_id(db, comment_id)
    if comment is None or comment.task_id != task_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Comment not found")
    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only delete your own comments")
    comment_repository.delete(db, comment)
