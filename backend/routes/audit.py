from math import ceil

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from repositories import audit_repository
from schemas.audit import AuditLogListResponse
from services import audit_service
from utils.dependencies import require_roles

router = APIRouter(prefix="/audit-logs", tags=["audit"])


@router.get("", response_model=AuditLogListResponse)
def list_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    """Application audit trail (admin only)."""
    logs, total = audit_repository.list_logs(db, page=page, limit=limit)
    return AuditLogListResponse(
        items=[audit_service.to_response(log) for log in logs],
        total=total,
        page=page,
        limit=limit,
        pages=max(1, ceil(total / limit)),
    )
