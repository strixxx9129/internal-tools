from pydantic import BaseModel

from schemas.task import TaskResponse


class DashboardStats(BaseModel):
    total_tasks: int
    pending: int
    in_progress: int
    completed: int
    blocked: int
    overdue: int
    my_tasks: int
    unassigned: int
    tasks_by_status: dict[str, int]
    tasks_by_priority: dict[str, int]
    recent_tasks: list[TaskResponse]
