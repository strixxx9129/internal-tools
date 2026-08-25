from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from models.task import Task
from models.user import User
from schemas.dashboard import DashboardStats
from utils.time import utcnow


def _count_by_status(db: Session, status: str) -> int:
    return db.query(func.count(Task.id)).filter(Task.status == status).scalar() or 0


def get_stats(db: Session, current_user: User) -> DashboardStats:
    now = utcnow()
    total = db.query(func.count(Task.id)).scalar() or 0

    overdue = (
        db.query(func.count(Task.id))
        .filter(Task.due_date.isnot(None), Task.due_date < now, Task.status != "completed")
        .scalar()
        or 0
    )
    my_tasks = (
        db.query(func.count(Task.id))
        .filter(Task.assigned_to == current_user.id, Task.status != "completed")
        .scalar()
        or 0
    )
    unassigned = (
        db.query(func.count(Task.id)).filter(Task.assigned_to.is_(None)).scalar() or 0
    )

    status_rows = db.query(Task.status, func.count(Task.id)).group_by(Task.status).all()
    priority_rows = db.query(Task.priority, func.count(Task.id)).group_by(Task.priority).all()

    recent_tasks = (
        db.query(Task)
        .options(joinedload(Task.assignee), joinedload(Task.creator))
        .order_by(Task.updated_at.desc())
        .limit(6)
        .all()
    )

    return DashboardStats(
        total_tasks=total,
        pending=_count_by_status(db, "pending"),
        in_progress=_count_by_status(db, "in_progress"),
        completed=_count_by_status(db, "completed"),
        blocked=_count_by_status(db, "blocked"),
        overdue=overdue,
        my_tasks=my_tasks,
        unassigned=unassigned,
        tasks_by_status={row[0]: row[1] for row in status_rows},
        tasks_by_priority={row[0]: row[1] for row in priority_rows},
        recent_tasks=recent_tasks,
    )
