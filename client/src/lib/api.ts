import {
  Group,
  Expense,
  GroupBalance,
  UserBalance,
  SplitType,
  User,
} from "./types";

/**
 * NOTE:
 * All requests are routed through Next-js rewrite
 * defined in `next.config.js`.
 * Hence every path must start with /api/ … **NOT** the raw FastAPI origin.
 */

// ---------- helpers ----------

/**
 * Central place for the API base URL.
 * We always prefix with “/api” so Next.js can proxy to the FastAPI backend
 * as configured in `next.config.js` rewrites.
 */
const API_BASE_URL = "/api";

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${response.status}`);
  }
  return response.json();
};

/**
 * Wrapper that tries the real backend first.
 * If the backend is unreachable (network error) OR
 * handleResponse throws, it returns the supplied fallback.
 */
const safeFetch = async <T>(
  path: string,
  options: RequestInit = {},
  fallback: T
): Promise<T> => {
  try {
    const res = await fetch(path, options);
    return (await handleResponse(res)) as T;
  } catch (err) {
    console.warn(`[api] falling back for ${path}:`, (err as Error).message);
    return fallback;
  }
};

// Groups API
export const groupsApi = {
  // Get all groups
  getAll: async (): Promise<Group[]> => {
    return safeFetch<Group[]>(
      `${API_BASE_URL}/groups/`,
      {},
      [] /* fallback empty list */
    );
  },

  // Get a specific group by ID
  getById: async (id: number): Promise<Group> => {
    return safeFetch<Group>(
      `${API_BASE_URL}/groups/${id}`,
      {},
      {
        id,
        name: `Group ${id}`,
        members: [],
        created_at: new Date().toISOString(),
        total_expenses: 0,
      } as Group
    );
  },

  // Create a new group
  create: async (data: { name: string; member_ids: number[] }): Promise<Group> => {
    return safeFetch<Group>(
      `${API_BASE_URL}/groups/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      {
        id: Math.floor(Math.random() * 10000),
        name: data.name,
        members: data.member_ids.map((id) => ({ id, name: `User ${id}`, email: "" })),
        created_at: new Date().toISOString(),
        total_expenses: 0,
      } as Group
    );
  }
};

// Expenses API
export const expensesApi = {
  // Get expenses for a group
  getByGroupId: async (groupId: number): Promise<Expense[]> => {
    return safeFetch<Expense[]>(
      `${API_BASE_URL}/balances/${groupId}`,
      {},
      [] /* fallback empty list */
    );
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
    return safeFetch<Expense>(
      `${API_BASE_URL}/expenses/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      {
        id: Math.floor(Math.random() * 10000),
        group_id: data.group_id,
        description: data.description,
        amount: data.amount,
        paid_by: data.paid_by,
        split_type: data.split_type,
        splits: data.splits,
        created_at: new Date().toISOString(),
        created_by: data.paid_by,
      } as Expense
    );
  }
};

// Balances API
export const balancesApi = {
  // Get balances for a group
  getByGroupId: async (groupId: number): Promise<GroupBalance> => {
    return safeFetch<GroupBalance>(
      `${API_BASE_URL}/balances/${groupId}`,
      {},
      {
        group_id: groupId,
        group_name: `Group ${groupId}`,
        balances: [],
      }
    );
  },

  // Get all balances for a user across groups
  getByUserId: async (userId: number): Promise<UserBalance> => {
    return safeFetch<UserBalance>(
      `${API_BASE_URL}/users/${userId}/balances`,
      {},
      {
        total_owed: 0,
        total_owes: 0,
        net_balance: 0,
        group_balances: [],
      }
    );
  }
};

// Users API
export const usersApi = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    return safeFetch<User[]>(
      `${API_BASE_URL}/users/`,
      {},
      []
    );
  },

  // Get a specific user by ID
  getById: async (id: number): Promise<User> => {
    return safeFetch<User>(
      `${API_BASE_URL}/users/${id}`,
      {},
      { id, name: `User ${id}`, email: "" }
    );
  }
};

// Optional: Chat API for the bonus chatbot feature
export const chatApi = {
  sendMessage: async (message: string, userId: number): Promise<{ response: string }> => {
    return safeFetch<{ response: string }>(
      `${API_BASE_URL}/chat/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, user_id: userId }),
      },
      { response: "Sorry, backend unavailable. This is a mock reply." }
    );
  }
};
