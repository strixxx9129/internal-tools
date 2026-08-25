from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.task import Task
from models.user import User
from repositories import activity_repository, comment_repository, task_repository, user_repository
from schemas.comment import CommentCreate
from schemas.task import TaskCreate, TaskUpdate
from services.audit_service import log_audit

FIELD_LABELS = {
    "title": "title",
    "description": "description",
    "status": "status",
    "priority": "priority",
    "assigned_to": "assignee",
    "due_date": "due date",
}


def _format_value(db: Session, field: str, value) -> str:
    if value is None or value == "":
        return "(none)"
    if field == "assigned_to":
        user = user_repository.get_by_id(db, value)
        return user.name if user else f"#{value}"
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d %H:%M")
    return str(value)


def _require_task(db: Session, task_id: int) -> Task:
    task = task_repository.get_by_id(db, task_id)
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    return task


def _validate_assignee(db: Session, assigned_to: Optional[int]) -> None:
    if assigned_to is not None and user_repository.get_by_id(db, assigned_to) is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Assignee with id {assigned_to} does not exist")


def create_task(db: Session, data: TaskCreate, current_user: User) -> Task:
    _validate_assignee(db, data.assigned_to)
    task = task_repository.create(db, **data.model_dump(), created_by=current_user.id)
    activity_repository.add(
        db,
        task_id=task.id,
        user_id=current_user.id,
        action="created",
        detail=f"Task created with status '{task.status}' and priority '{task.priority}'",
    )
    log_audit(db, user_id=current_user.id, action="task.create", entity_type="task",
              entity_id=task.id, details=f"Created task '{task.title}'")
    return task


def update_task(db: Session, task_id: int, data: TaskUpdate, current_user: User) -> Task:
    task = _require_task(db, task_id)
    updates = data.model_dump(exclude_unset=True)
    if "assigned_to" in updates:
        _validate_assignee(db, updates["assigned_to"])

    changes = []
    for field, new_value in updates.items():
        old_value = getattr(task, field)
        if old_value != new_value:
            changes.append((field, old_value, new_value))

    if not changes:
        return task

    task = task_repository.update(db, task, updates)
    for field, old_value, new_value in changes:
        label = FIELD_LABELS.get(field, field)
        old_text = _format_value(db, field, old_value)
        new_text = _format_value(db, field, new_value)
        action = "status_changed" if field == "status" else "updated"
        activity_repository.add(
            db, task_id=task.id, user_id=current_user.id, action=action,
            detail=f"Changed {label} from '{old_text}' to '{new_text}'",
        )
    log_audit(db, user_id=current_user.id, action="task.update", entity_type="task",
              entity_id=task.id, details=f"Updated fields: {', '.join(c[0] for c in changes)}")
    return task


def delete_task(db: Session, task_id: int, current_user: User) -> None:
    task = _require_task(db, task_id)
    log_audit(db, user_id=current_user.id, action="task.delete", entity_type="task",
              entity_id=task.id, details=f"Deleted task '{task.title}'")
    task_repository.delete(db, task)


def add_comment(db: Session, task_id: int, data: CommentCreate, current_user: User):
    _require_task(db, task_id)
    comment = comment_repository.create(
        db, task_id=task_id, user_id=current_user.id, comment=data.comment
    )
    activity_repository.add(
        db, task_id=task_id, user_id=current_user.id,
        action="commented", detail=f"Added a comment: \"{data.comment[:80]}\"",
    )
    return comment
