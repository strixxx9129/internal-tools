from typing import Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from models.task import Task
from models.user import User


def get_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower()).first()


def list_users(db: Session, search: Optional[str] = None) -> list[User]:
    query = db.query(User)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(User.name.ilike(like), User.email.ilike(like)))
    return query.order_by(User.name).all()


def create(db: Session, *, name: str, email: str, hashed_password: str, role: str) -> User:
    user = User(name=name, email=email.lower(), hashed_password=hashed_password, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update(db: Session, user: User, fields: dict) -> User:
    for key, value in fields.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def delete(db: Session, user: User) -> None:
    # Detach the user from existing tasks before removal.
    db.query(Task).filter(Task.assigned_to == user.id).update({"assigned_to": None})
    db.query(Task).filter(Task.created_by == user.id).update({"created_by": None})
    db.delete(user)
    db.commit()
