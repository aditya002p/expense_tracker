from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class Balance(Base):
    __tablename__ = "balances"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    owes_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owed_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    group = relationship("Group")
    owes_user = relationship("User", foreign_keys=[owes_user_id], back_populates="balances_owed")
    owed_to_user = relationship("User", foreign_keys=[owed_to_user_id], back_populates="balances_owed_to")