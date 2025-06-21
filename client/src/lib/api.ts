import { Group, Expense, Balance, GroupBalance, UserBalance, SplitType, User } from './types';

// Base API URL - should be configured from environment variables in a real app
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${response.status}`);
  }
  return response.json();
};

// Groups API
export const groupsApi = {
  // Get all groups
  getAll: async (): Promise<Group[]> => {
    const response = await fetch(`${API_BASE_URL}/groups/`);
    return handleResponse(response);
  },

  // Get a specific group by ID
  getById: async (id: number): Promise<Group> => {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`);
    return handleResponse(response);
  },

  // Create a new group
  create: async (data: { name: string; member_ids: number[] }): Promise<Group> => {
    const response = await fetch(`${API_BASE_URL}/groups/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }
};

// Expenses API
export const expensesApi = {
  // Get expenses for a group
  getByGroupId: async (groupId: number): Promise<Expense[]> => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/expenses`);
    return handleResponse(response);
  },

  // Add a new expense
  create: async (data: {
    group_id: number;
    description: string;
    amount: number;
    paid_by: number;
    split_type: SplitType;
    splits: { user_id: number; amount?: number; percentage?: number }[];
  }): Promise<Expense> => {
    const response = await fetch(`${API_BASE_URL}/groups/${data.group_id}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }
};

// Balances API
export const balancesApi = {
  // Get balances for a group
  getByGroupId: async (groupId: number): Promise<GroupBalance> => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/balances`);
    return handleResponse(response);
  },

  // Get all balances for a user across groups
  getByUserId: async (userId: number): Promise<UserBalance> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/balances`);
    return handleResponse(response);
  }
};

// Users API
export const usersApi = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users/`);
    return handleResponse(response);
  },

  // Get a specific user by ID
  getById: async (id: number): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    return handleResponse(response);
  }
};

// Optional: Chat API for the bonus chatbot feature
export const chatApi = {
  sendMessage: async (message: string, userId: number): Promise<{ response: string }> => {
    const response = await fetch(`${API_BASE_URL}/chat/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, user_id: userId }),
    });
    return handleResponse(response);
  }
};
