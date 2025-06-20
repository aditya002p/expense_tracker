from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.group import Group, GroupMember

def get_current_user(user_id: int, db: Session = Depends(get_db)) -> User:
    """Get current user - simplified for demo (no auth)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

def verify_group_member(group_id: int, user_id: int, db: Session = Depends(get_db)) -> bool:
    """Verify user is a member of the group"""
    member = (
        db.query(GroupMember)
        .filter(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
        .first()
    )
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a member of this group"
        )
    return True