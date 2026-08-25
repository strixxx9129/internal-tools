from sqlalchemy.orm import Session, joinedload

from models.activity import TaskActivity


def add(db: Session, *, task_id: int, user_id: int | None, action: str, detail: str = "") -> TaskActivity:
    entry = TaskActivity(task_id=task_id, user_id=user_id, action=action, detail=detail)
    db.add(entry)
    db.commit()
    return entry


def list_for_task(db: Session, task_id: int) -> list[TaskActivity]:
    return (
        db.query(TaskActivity)
        .options(joinedload(TaskActivity.user))
        .filter(TaskActivity.task_id == task_id)
        .order_by(TaskActivity.created_at.desc())
        .all()
    )
