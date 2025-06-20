from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.schemas.user import User

class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None

class GroupCreate(GroupBase):
    member_ids: List[int]

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class GroupMember(BaseModel):
    user: User
    joined_at: datetime
    
    class Config:
        from_attributes = True

class Group(GroupBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    members: List[GroupMember] = []
    total_expenses: float = 0.0
    
    class Config:
        from_attributes = True