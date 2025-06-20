from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.group import Group, GroupMember
from app.models.user import User
from app.schemas.group import GroupCreate, GroupUpdate
from app.core.exceptions import GroupNotFound, UserNotFound

class GroupService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_group(self, group_data: GroupCreate) -> Group:
        # Verify all users exist
        for user_id in group_data.member_ids:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise UserNotFound(user_id)
        
        # Create group
        db_group = Group(
            name=group_data.name,
            description=group_data.description
        )
        self.db.add(db_group)
        self.db.flush()  # Get the ID
        
        # Add members
        for user_id in group_data.member_ids:
            member = GroupMember(group_id=db_group.id, user_id=user_id)
            self.db.add(member)
        
        self.db.commit()
        self.db.refresh(db_group)
        return db_group
    
    def get_group(self, group_id: int) -> Group:
        group = self.db.query(Group).filter(Group.id == group_id).first()
        if not group:
            raise GroupNotFound(group_id)
        return group
    
    def get_user_groups(self, user_id: int) -> List[Group]:
        return (
            self.db.query(Group)
            .join(GroupMember)
            .filter(GroupMember.user_id == user_id)
            .all()
        )
    
    def update_group(self, group_id: int, group_data: GroupUpdate) -> Group:
        group = self.get_group(group_id)
        
        if group_data.name is not None:
            group.name = group_data.name
        if group_data.description is not None:
            group.description = group_data.description
            
        self.db.commit()
        self.db.refresh(group)
        return group
    
    def delete_group(self, group_id: int) -> bool:
        group = self.get_group(group_id)
        self.db.delete(group)
        self.db.commit()
        return True
    
    def add_member(self, group_id: int, user_id: int) -> Group:
        group = self.get_group(group_id)
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise UserNotFound(user_id)
        
        # Check if already a member
        existing = (
            self.db.query(GroupMember)
            .filter(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
            .first()
        )
        
        if not existing:
            member = GroupMember(group_id=group_id, user_id=user_id)
            self.db.add(member)
            self.db.commit()
        
        self.db.refresh(group)
        return group