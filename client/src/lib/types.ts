export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface Group {
  id: number;
  name: string;
  members: User[];
  created_at: string;
  total_expenses?: number;
}

export enum SplitType {
  EQUAL = "equal",
  PERCENTAGE = "percentage"
}

export interface Split {
  user_id: number;
  amount?: number;  // For actual amount in currency
  percentage?: number;  // For percentage splits
}

export interface Expense {
  id: number;
  group_id: number;
  description: string;
  amount: number;
  paid_by: number;  // User ID of who paid
  split_type: SplitType;
  splits: Split[];
  created_at: string;
  created_by: number;
}

export interface Balance {
  from_user_id: number;
  from_user_name?: string;
  to_user_id: number;
  to_user_name?: string;
  amount: number;
}

export interface GroupBalance {
  group_id: number;
  group_name: string;
  balances: Balance[];
}

export interface UserBalance {
  total_owed: number;  // Money others owe to this user
  total_owes: number;  // Money this user owes to others
  net_balance: number; // total_owed - total_owes
  group_balances: GroupBalance[];
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
}
