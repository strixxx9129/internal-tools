"""Idempotent seed data: demo users, tasks, comments and activity entries."""
from datetime import timedelta

from sqlalchemy.orm import Session

from models.activity import TaskActivity
from models.comment import Comment
from models.task import Task
from models.user import User
from utils.security import hash_password
from utils.time import utcnow


def seed_database(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    users = [
        User(name="Admin User", email="admin@internaltool.dev",
             hashed_password=hash_password("admin123"), role="admin"),
        User(name="Maya Manager", email="maya@internaltool.dev",
             hashed_password=hash_password("manager123"), role="manager"),
        User(name="Dev Patel", email="dev@internaltool.dev",
             hashed_password=hash_password("member123"), role="member"),
        User(name="Sarah Lee", email="sarah@internaltool.dev",
             hashed_password=hash_password("member123"), role="member"),
    ]
    db.add_all(users)
    db.flush()

    now = utcnow()
    tasks = [
        Task(title="Design onboarding flow",
             description="Create wireframes for the new employee onboarding experience in the HR portal.",
             status="in_progress", priority="high", assigned_to=users[2].id,
             created_by=users[1].id, due_date=now + timedelta(days=3)),
        Task(title="Fix payment webhook retries",
             description="Stripe webhooks are not being retried after 5xx responses. Add exponential backoff.",
             status="pending", priority="urgent", assigned_to=users[2].id,
             created_by=users[0].id, due_date=now - timedelta(days=2)),
        Task(title="Quarterly access review",
             description="Audit who has admin access to production systems and revoke stale accounts.",
             status="pending", priority="medium", assigned_to=users[0].id,
             created_by=users[1].id, due_date=now + timedelta(days=10)),
        Task(title="Update customer import script",
             description="Support the new CSV format from the sales team and validate emails on import.",
             status="completed", priority="low", assigned_to=users[3].id,
             created_by=users[2].id, due_date=now - timedelta(days=5)),
        Task(title="Investigate inventory sync latency",
             description="Nightly sync with the warehouse system has doubled in duration. Profile and fix.",
             status="blocked", priority="high", assigned_to=users[3].id,
             created_by=users[1].id, due_date=now + timedelta(days=1)),
        Task(title="Write internal API usage docs",
             description="Document authentication, rate limits and example calls for the public API.",
             status="pending", priority="medium", assigned_to=None,
             created_by=users[0].id, due_date=now + timedelta(days=14)),
        Task(title="Migrate reports to new schema",
             description="Point the reporting jobs at the v2 analytics tables and deprecate the old ones.",
             status="in_progress", priority="medium", assigned_to=users[1].id,
             created_by=users[0].id, due_date=now + timedelta(days=7)),
        Task(title="Clean up stale sessions job",
             description="Cron job that removes expired sessions older than 30 days from the auth store.",
             status="completed", priority="low", assigned_to=users[2].id,
             created_by=users[2].id, due_date=None),
    ]
    db.add_all(tasks)
    db.flush()

    comments = [
        Comment(task_id=tasks[0].id, user_id=users[1].id,
                comment="Please share the first draft by Thursday."),
        Comment(task_id=tasks[0].id, user_id=users[2].id,
                comment="Draft is in progress — will upload the wireframes tomorrow."),
        Comment(task_id=tasks[4].id, user_id=users[3].id,
                comment="Blocked on the vendor API credentials, chased the account manager."),
    ]

    activities = [
        TaskActivity(task_id=task.id, user_id=task.created_by, action="created",
                     detail=f"Task created with status '{task.status}' and priority '{task.priority}'")
        for task in tasks
    ]
    activities.append(
        TaskActivity(task_id=tasks[0].id, user_id=users[2].id, action="status_changed",
                     detail="Changed status from 'pending' to 'in_progress'")
    )

    db.add_all(comments + activities)
    db.commit()
