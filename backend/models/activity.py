from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base
from utils.time import utcnow


class TaskActivity(Base):
    """Per-task history entries (created, field changes, comments...)."""

    __tablename__ = "task_activities"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(50), nullable=False)  # created | updated | status_changed | commented ...
    detail = Column(Text, nullable=False, default="")
    created_at = Column(DateTime, default=utcnow, nullable=False)

    task = relationship("Task", back_populates="activities")
    user = relationship("User")


class AuditLog(Base):
    """Application-wide audit trail for sensitive actions."""

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(50), nullable=False, index=True)  # auth.login | task.create | task.delete | user.create ...
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=False, default="")
    created_at = Column(DateTime, default=utcnow, nullable=False, index=True)

    user = relationship("User")
