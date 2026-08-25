from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from repositories import user_repository
from schemas.user import UserCreate, UserResponse, UserUpdate
from services.audit_service import log_audit
from utils.dependencies import get_current_user, require_roles
from utils.security import hash_password

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
def list_users(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return user_repository.list_users(db, search=search)


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    if user_repository.get_by_email(db, payload.email):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "A user with this email already exists")
    user = user_repository.create(
        db,
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    log_audit(db, user_id=current_user.id, action="user.create", entity_type="user",
              entity_id=user.id, details=f"Created user {user.email} with role '{user.role}'")
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    user = user_repository.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    fields = payload.model_dump(exclude_unset=True)
    if "password" in fields:
        fields["hashed_password"] = hash_password(fields.pop("password"))
    user = user_repository.update(db, user, fields)
    log_audit(db, user_id=current_user.id, action="user.update", entity_type="user",
              entity_id=user.id, details=f"Updated fields: {', '.join(fields.keys())}")
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    if user_id == current_user.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You cannot delete your own account")
    user = user_repository.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    log_audit(db, user_id=current_user.id, action="user.delete", entity_type="user",
              entity_id=user.id, details=f"Deleted user {user.email}")
    user_repository.delete(db, user)
