from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from database import Base
from utils.time import utcnow


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="member")  # admin | manager | member
    created_at = Column(DateTime, default=utcnow, nullable=False)

    tasks_assigned = relationship(
        "Task", back_populates="assignee", foreign_keys="Task.assigned_to"
    )
    tasks_created = relationship(
        "Task", back_populates="creator", foreign_keys="Task.created_by"
    )
    comments = relationship("Comment", back_populates="user")
