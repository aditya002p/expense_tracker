from openai import OpenAI
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import json
from app.core.config import settings
from app.models.user import User
from app.models.group import Group
from app.models.expense import Expense
from app.services.balance_service import BalanceService
from app.services.expense_service import ExpenseService
from app.services.group_service import GroupService

class LLMService:
    def __init__(self, db: Session):
        self.db = db
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        self.balance_service = BalanceService(db)
        self.expense_service = ExpenseService(db)
        self.group_service = GroupService(db)
    
    async def process_query(self, query: str, user_id: int) -> str:
        """Process natural language query about expenses and balances"""
        
        if not self.client:
            return "LLM service is not configured. Please set OPENAI_API_KEY."
        
        # Get user context
        context = self._get_user_context(user_id)
        
        # Create system prompt
        system_prompt = self._create_system_prompt(context)
        
        try:
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                temperature=0.1,
                max_tokens=500
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            return f"Sorry, I encountered an error processing your request: {str(e)}"
    
    def _get_user_context(self, user_id: int) -> Dict[str, Any]:
        """Get relevant context for the user"""
        
        # Get user info
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {}
        
        # Get user's groups
        groups = self.group_service.get_user_groups(user_id)
        
        # Get recent expenses
        recent_expenses = (
            self.db.query(Expense)
            .join(Group)
            .filter(
                Group.id.in_([g.id for g in groups])
            )
            .order_by(Expense.created_at.desc())
            .limit(10)
            .all()
        )
        
        # Get balance summary
        balance_summary = self.balance_service.get_user_balance_summary(user_id)
        
        # Format context
        context = {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            },
            "groups": [
                {
                    "id": group.id,
                    "name": group.name,
                    "member_count": len(group.members)
                }
                for group in groups
            ],
            "recent_expenses": [
                {
                    "id": expense.id,
                    "description": expense.description,
                    "amount": expense.amount,
                    "group_name": expense.group.name,
                    "paid_by": expense.paid_by_user.name,
                    "created_at": expense.created_at.isoformat()
                }
                for expense in recent_expenses
            ],
            "balance_summary": {
                "total_owed": balance_summary.total_owed,
                "total_owing": balance_summary.total_owing,
                "net_balance": balance_summary.net_balance
            }
        }
        
        return context
    
    def _create_system_prompt(self, context: Dict[str, Any]) -> str:
        """Create system prompt with user context"""
        
        context_str = json.dumps(context, indent=2)
        
        return f"""
You are an AI assistant for a Splitwise-like expense sharing application. 
You help users understand their expenses, balances, and group activities through natural language queries.

Current user context:
{context_str}

Instructions:
1. Answer questions about the user's expenses, balances, and groups based on the provided context
2. Be conversational and helpful
3. Format monetary amounts clearly (e.g., $12.50)
4. If asked about specific data not in the context, mention that you need more current information
5. For balance-related questions, explain whether the user owes money or is owed money
6. Keep responses concise but informative
7. If the user asks about functionality not covered by the data, explain what the app can do

Example queries you can handle:
- "How much do I owe in total?"
- "What were my recent expenses?"
- "How much does Alice owe me?"
- "Show me expenses from the Weekend Trip group"
- "Who paid the most in my groups?"
"""

    def get_expense_insights(self, group_id: int) -> Dict[str, Any]:
        """Get AI-powered insights about group expenses"""
        
        if not self.client:
            return {"error": "LLM service not configured"}
        
        # Get group data
        group = self.group_service.get_group(group_id)
        expenses = self.expense_service.get_group_expenses(group_id)
        balances = self.balance_service.get_group_balances(group_id)
        
        # Prepare data for analysis
        expense_data = [
            {
                "description": exp.description,
                "amount": exp.amount,
                "paid_by": exp.paid_by_user.name,
                "split_type": exp.split_type.value,
                "date": exp.created_at.isoformat()
            }
            for exp in expenses[:20]  # Last 20 expenses
        ]
        
        balance_data = [
            {
                "owes": balance.owes_user.name,
                "owed_to": balance.owed_to_user.name,
                "amount": balance.amount
            }
            for balance in balances
        ]
        
        prompt = f"""
Analyze the following expense data for the group "{group.name}" and provide insights:

Expenses:
{json.dumps(expense_data, indent=2)}

Current Balances:
{json.dumps(balance_data, indent=2)}

Please provide:
1. Summary of spending patterns
2. Who contributes the most/least
3. Most common expense types
4. Any interesting observations
5. Suggestions for the group

Keep the response conversational and under 300 words.
"""
        
        try:
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=400
            )
            
            return {
                "insights": response.choices[0].message.content.strip(),
                "group_name": group.name,
                "total_expenses": len(expenses),
                "total_amount": sum(exp.amount for exp in expenses)
            }
            
        except Exception as e:
            return {"error": f"Failed to generate insights: {str(e)}"}