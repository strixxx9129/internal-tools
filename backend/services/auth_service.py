from typing import Optional

from sqlalchemy.orm import Session

from models.user import User
from repositories import user_repository
from utils.security import create_access_token, verify_password


def authenticate(db: Session, email: str, password: str) -> Optional[User]:
    user = user_repository.get_by_email(db, email)
    if user is None or not verify_password(password, user.hashed_password):
        return None
    return user


def create_token(user: User) -> str:
    return create_access_token(subject=str(user.id), role=user.role)
