from typing import Optional

from sqlalchemy.orm import Session, joinedload

from models.comment import Comment


def get_by_id(db: Session, comment_id: int) -> Optional[Comment]:
    return (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(Comment.id == comment_id)
        .first()
    )


def list_for_task(db: Session, task_id: int) -> list[Comment]:
    return (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(Comment.task_id == task_id)
        .order_by(Comment.created_at)
        .all()
    )


def create(db: Session, *, task_id: int, user_id: int, comment: str) -> Comment:
    new_comment = Comment(task_id=task_id, user_id=user_id, comment=comment)
    db.add(new_comment)
    db.commit()
    return get_by_id(db, new_comment.id)


def delete(db: Session, comment: Comment) -> None:
    db.delete(comment)
    db.commit()
