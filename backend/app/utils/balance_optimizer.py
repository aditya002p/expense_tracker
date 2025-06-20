from typing import List, Dict, Tuple
from app.schemas.balance import SettlementSuggestion, BalanceDetail
from app.schemas.user import User

class BalanceOptimizer:
    @staticmethod
    def optimize_settlements(balances: List[BalanceDetail]) -> List[SettlementSuggestion]:
        """
        Optimize settlements to minimize the number of transactions needed.
        Uses a greedy approach to match debtors with creditors.
        """
        
        # Calculate net balances for each user
        net_balances: Dict[int, float] = {}
        user_map: Dict[int, User] = {}
        
        for balance in balances:
            owes_id = balance.owes_user.id
            owed_to_id = balance.owed_to_user.id
            
            # Track users
            user_map[owes_id] = balance.owes_user
            user_map[owed_to_id] = balance.owed_to_user
            
            # Calculate net balances
            net_balances[owes_id] = net_balances.get(owes_id, 0) - balance.amount
            net_balances[owed_to_id] = net_balances.get(owed_to_id, 0) + balance.amount
        
        # Separate debtors and creditors
        debtors = [(user_id, abs(amount)) for user_id, amount in net_balances.items() if amount < -0.01]
        creditors = [(user_id, amount) for user_id, amount in net_balances.items() if amount > 0.01]
        
        # Sort by amount (largest first) for better optimization
        debtors.sort(key=lambda x: x[1], reverse=True)
        creditors.sort(key=lambda x: x[1], reverse=True)
        
        settlements = []
        
        # Match debtors with creditors
        while debtors and creditors:
            debtor_id, debt_amount = debtors[0]
            creditor_id, credit_amount = creditors[0]
            
            # Settle the smaller amount
            settlement_amount = min(debt_amount, credit_amount)
            
            settlements.append(SettlementSuggestion(
                from_user=user_map[debtor_id],
                to_user=user_map[creditor_id],
                amount=round(settlement_amount, 2),
                description=f"Settlement from {user_map[debtor_id].name} to {user_map[creditor_id].name}"
            ))
            
            # Update amounts
            remaining_debt = debt_amount - settlement_amount
            remaining_credit = credit_amount - settlement_amount
            
            # Remove or update the lists
            if remaining_debt < 0.01:
                debtors.pop(0)
            else:
                debtors[0] = (debtor_id, remaining_debt)
            
            if remaining_credit < 0.01:
                creditors.pop(0)
            else:
                creditors[0] = (creditor_id, remaining_credit)
        
        return settlements