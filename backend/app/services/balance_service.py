from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Dict
from app.models.balance import Balance
from app.models.expense import Expense, ExpenseSplit
from app.models.user import User
from app.schemas.balance import BalanceDetail, UserBalanceSummary, SettlementSuggestion
from app.utils.balance_optimizer import BalanceOptimizer

class BalanceService:
    def __init__(self, db: Session):
        self.db = db
    
    def update_balances_for_expense(self, expense_id: int):
        """Update balances when a new expense is added"""
        expense = self.db.query(Expense).filter(Expense.id == expense_id).first()
        if not expense:
            return
        
        # Get all splits for this expense
        splits = self.db.query(ExpenseSplit).filter(ExpenseSplit.expense_id == expense_id).all()
        
        for split in splits:
            if split.user_id != expense.paid_by_user_id:
                # This user owes money to the person who paid
                self._update_balance(
                    expense.group_id,
                    split.user_id,  # owes
                    expense.paid_by_user_id,  # owed to
                    split.amount
                )
    
    def remove_balances_for_expense(self, expense_id: int):
        """Remove balance effects when an expense is deleted"""
        expense = self.db.query(Expense).filter(Expense.id == expense_id).first()
        if not expense:
            return
        
        splits = self.db.query(ExpenseSplit).filter(ExpenseSplit.expense_id == expense_id).all()
        
        for split in splits:
            if split.user_id != expense.paid_by_user_id:
                # Reverse the balance
                self._update_balance(
                    expense.group_id,
                    split.user_id,
                    expense.paid_by_user_id,
                    -split.amount  # Negative to reverse
                )
    
    def _update_balance(self, group_id: int, owes_user_id: int, owed_to_user_id: int, amount: float):
        """Update or create balance between two users"""
        
        # Check if balance already exists
        existing_balance = (
            self.db.query(Balance)
            .filter(
                Balance.group_id == group_id,
                Balance.owes_user_id == owes_user_id,
                Balance.owed_to_user_id == owed_to_user_id
            )
            .first()
        )
        
        # Also check reverse balance
        reverse_balance = (
            self.db.query(Balance)
            .filter(
                Balance.group_id == group_id,
                Balance.owes_user_id == owed_to_user_id,
                Balance.owed_to_user_id == owes_user_id
            )
            .first()
        )
        
        if existing_balance:
            existing_balance.amount += amount
            if existing_balance.amount <= 0.01:
                self.db.delete(existing_balance)
        elif reverse_balance:
            # Net out against reverse balance
            net_amount = reverse_balance.amount - amount
            if net_amount > 0.01:
                reverse_balance.amount = net_amount
            elif net_amount < -0.01:
                # Reverse direction
                reverse_balance.owes_user_id, reverse_balance.owed_to_user_id = reverse_balance.owed_to_user_id, reverse_balance.owes_user_id
                reverse_balance.amount = abs(net_amount)
            else:
                # Net zero, delete
                self.db.delete(reverse_balance)
        elif amount > 0.01:
            # Create new balance
            new_balance = Balance(
                group_id=group_id,
                owes_user_id=owes_user_id,
                owed_to_user_id=owed_to_user_id,
                amount=amount
            )
            self.db.add(new_balance)
        
        self.db.commit()
    
    def get_group_balances(self, group_id: int) -> List[BalanceDetail]:
        """Get all balances for a group"""
        balances = (
            self.db.query(Balance)
            .filter(Balance.group_id == group_id)
            .filter(Balance.amount > 0.01)
            .all()
        )
        
        return [
            BalanceDetail(
                owes_user=balance.owes_user,
                owed_to_user=balance.owed_to_user,
                amount=balance.amount
            )
            for balance in balances
        ]
    
    def get_user_balance_summary(self, user_id: int) -> UserBalanceSummary:
        """Get balance summary for a user across all groups"""
        
        # Amount user owes to others
        owes_balances = (
            self.db.query(Balance)
            .filter(Balance.owes_user_id == user_id)
            .all()
        )
        total_owing = sum(balance.amount for balance in owes_balances)
        
        # Amount others owe to user
        owed_balances = (
            self.db.query(Balance)
            .filter(Balance.owed_to_user_id == user_id)
            .all()
        )
        total_owed = sum(balance.amount for balance in owed_balances)
        
        user = self.db.query(User).filter(User.id == user_id).first()
        
        return UserBalanceSummary(
            user=user,
            total_owed=total_owed,
            total_owing=total_owing,
            net_balance=total_owed - total_owing
        )
    
    def get_settlement_suggestions(self, group_id: int) -> List[SettlementSuggestion]:
        """Get optimized settlement suggestions for a group"""
        balances = self.get_group_balances(group_id)
        return BalanceOptimizer.optimize_settlements(balances)