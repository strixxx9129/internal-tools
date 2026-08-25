from typing import Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from models.comment import Comment
from models.activity import TaskActivity
from models.task import Task

# Whitelisted sortable columns (protects against arbitrary column injection).
SORTABLE_COLUMNS = {
    "title": Task.title,
    "status": Task.status,
    "priority": Task.priority,
    "due_date": Task.due_date,
    "created_at": Task.created_at,
    "updated_at": Task.updated_at,
}


def get_by_id(db: Session, task_id: int) -> Optional[Task]:
    return (
        db.query(Task)
        .options(
            joinedload(Task.assignee),
            joinedload(Task.creator),
            joinedload(Task.comments).joinedload(Comment.user),
            joinedload(Task.activities).joinedload(TaskActivity.user),
        )
        .filter(Task.id == task_id)
        .first()
    )


def list_tasks(
    db: Session,
    *,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assignee: Optional[int] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Task], int]:
    query = db.query(Task).options(joinedload(Task.assignee), joinedload(Task.creator))

    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if assignee is not None:
        query = query.filter(Task.assigned_to == assignee)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Task.title.ilike(like), Task.description.ilike(like)))

    total = query.count()

    column = SORTABLE_COLUMNS.get(sort_by, Task.created_at)
    query = query.order_by(column.asc() if sort_dir == "asc" else column.desc())

    items = query.offset((page - 1) * limit).limit(limit).all()
    return items, total


def create(db: Session, **fields) -> Task:
    task = Task(**fields)
    db.add(task)
    db.commit()
    return get_by_id(db, task.id)


def update(db: Session, task: Task, fields: dict) -> Task:
    for key, value in fields.items():
        setattr(task, key, value)
    db.commit()
    return get_by_id(db, task.id)


def delete(db: Session, task: Task) -> None:
    db.delete(task)
    db.commit()
