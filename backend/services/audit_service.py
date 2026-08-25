from sqlalchemy.orm import Session

from models.activity import AuditLog
from repositories import audit_repository
from schemas.audit import AuditLogResponse


def log_audit(
    db: Session,
    *,
    user_id: int | None,
    action: str,
    entity_type: str,
    entity_id: int | None = None,
    details: str = "",
) -> AuditLog:
    return audit_repository.add(
        db,
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
    )


def to_response(log: AuditLog) -> AuditLogResponse:
    return AuditLogResponse(
        id=log.id,
        action=log.action,
        entity_type=log.entity_type,
        entity_id=log.entity_id,
        details=log.details,
        created_at=log.created_at,
        user_name=log.user.name if log.user else "system",
    )
