from sqlalchemy.orm import Session, joinedload

from models.activity import AuditLog


def add(
    db: Session,
    *,
    user_id: int | None,
    action: str,
    entity_type: str,
    entity_id: int | None = None,
    details: str = "",
) -> AuditLog:
    entry = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
    )
    db.add(entry)
    db.commit()
    return entry


def list_logs(db: Session, *, page: int = 1, limit: int = 20) -> tuple[list[AuditLog], int]:
    query = db.query(AuditLog).options(joinedload(AuditLog.user))
    total = query.count()
    items = (
        query.order_by(AuditLog.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return items, total
