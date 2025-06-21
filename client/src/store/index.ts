// src/store/index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  Group,
  User,
  Expense,
  Balance,
  UserBalance,
  GroupBalance,
  SplitType,
} from "@/lib/types";
import {
  usersApi,
  groupsApi,
  expensesApi,
  balancesApi,
} from "@/lib/api";

// User Store
interface UserState {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  error: string | null;
  setCurrentUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        currentUser: { id: 1, name: "John Doe", email: "john@example.com" }, // Mock current user
        users: [],
        isLoading: false,
        error: null,
        setCurrentUser: (user) => set({ currentUser: user }),
        setUsers: (users) => set({ users }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        fetchUsers: async () => {
          try {
            set({ isLoading: true, error: null });
            const users = await usersApi.getAll();
            set({ users, isLoading: false });
          } catch (error) {
            set({ error: 'Failed to fetch users', isLoading: false });
            console.error('Error fetching users:', error);
          }
        },
      }),
      {
        name: 'user-store',
        partialize: (state) => ({ currentUser: state.currentUser }),
      }
    )
  )
);

// Groups Store
interface GroupsState {
  groups: Group[];
  selectedGroup: Group | null;
  isLoading: boolean;
  error: string | null;
  setGroups: (groups: Group[]) => void;
  setSelectedGroup: (group: Group | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchGroups: () => Promise<void>;
  fetchGroupById: (groupId: number) => Promise<void>;
  createGroup: (name: string, memberIds: number[]) => Promise<Group | null>;
  addMemberToGroup: (groupId: number, userId: number) => Promise<void>;
}

export const useGroupsStore = create<GroupsState>()(
  devtools(
    (set, get) => ({
      groups: [],
      selectedGroup: null,
      isLoading: false,
      error: null,
      setGroups: (groups) => set({ groups }),
      setSelectedGroup: (group) => set({ selectedGroup: group }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      fetchGroups: async () => {
        try {
          set({ isLoading: true, error: null });
          const groups = await groupsApi.getAll();
          set({ groups, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch groups', isLoading: false });
          console.error('Error fetching groups:', error);
        }
      },
      fetchGroupById: async (groupId) => {
        try {
          set({ isLoading: true, error: null });
          const group = await groupsApi.getById(groupId);
          set({ selectedGroup: group, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch group details', isLoading: false });
          console.error('Error fetching group:', error);
        }
      },
      createGroup: async (name, memberIds) => {
        try {
          set({ isLoading: true, error: null });
          const newGroup = await groupsApi.create({
            name,
            member_ids: memberIds,
          });
          set((state) => ({ 
            groups: [...state.groups, newGroup],
            isLoading: false 
          }));
          
          return newGroup;
        } catch (error) {
          set({ error: 'Failed to create group', isLoading: false });
          console.error('Error creating group:', error);
          return null;
        }
      },
      addMemberToGroup: async (groupId, userId) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`/api/groups/${groupId}/members`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to add member to group');
          }
          
          // Refresh group data
          await get().fetchGroupById(groupId);
          set({ isLoading: false });
        } catch (error) {
          set({ error: 'Failed to add member to group', isLoading: false });
          console.error('Error adding member:', error);
        }
      },
    })
  )
);

// Expenses Store
interface ExpensesState {
  expenses: Expense[];
  groupExpenses: Record<number, Expense[]>; // Grouped by groupId
  isLoading: boolean;
  error: string | null;
  filters: {
    dateRange: { start: Date | null; end: Date | null } | null;
    minAmount: number | null;
    maxAmount: number | null;
    paidBy: number | null;
    categories: string[];
    searchQuery: string;
  };
  setExpenses: (expenses: Expense[]) => void;
  setGroupExpenses: (groupId: number, expenses: Expense[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ExpensesState['filters']>) => void;
  resetFilters: () => void;
  fetchExpensesByGroupId: (groupId: number) => Promise<void>;
  createExpense: (expense: {
    group_id: number;
    description: string;
    amount: number;
    paid_by: number;
    split_type: SplitType;
    splits: { user_id: number; amount?: number; percentage?: number }[];
  }) => Promise<Expense | null>;
  getFilteredExpenses: (groupId?: number) => Expense[];
}

export const useExpensesStore = create<ExpensesState>()(
  devtools(
    (set, get) => ({
      expenses: [],
      groupExpenses: {},
      isLoading: false,
      error: null,
      filters: {
        dateRange: null,
        minAmount: null,
        maxAmount: null,
        paidBy: null,
        categories: [],
        searchQuery: '',
      },
      setExpenses: (expenses) => set({ expenses }),
      setGroupExpenses: (groupId, expenses) => 
        set((state) => ({
          groupExpenses: {
            ...state.groupExpenses,
            [groupId]: expenses,
          },
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setFilters: (filters) => 
        set((state) => ({
          filters: {
            ...state.filters,
            ...filters,
          },
        })),
      resetFilters: () => 
        set({
          filters: {
            dateRange: null,
            minAmount: null,
            maxAmount: null,
            paidBy: null,
            categories: [],
            searchQuery: '',
          },
        }),
      fetchExpensesByGroupId: async (groupId) => {
        try {
          set({ isLoading: true, error: null });
          const expenses = await expensesApi.getByGroupId(groupId);
          set((state) => ({
            groupExpenses: {
              ...state.groupExpenses,
              [groupId]: expenses,
            },
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to fetch expenses', isLoading: false });
          console.error('Error fetching expenses:', error);
        }
      },
      createExpense: async (expenseData) => {
        try {
          set({ isLoading: true, error: null });
          const newExpense = await expensesApi.create(expenseData);
          
          // Update expenses in store
          set((state) => {
            const groupId = expenseData.group_id;
            const currentGroupExpenses = state.groupExpenses[groupId] || [];
            
            return {
              groupExpenses: {
                ...state.groupExpenses,
                [groupId]: [...currentGroupExpenses, newExpense],
              },
              isLoading: false,
            };
          });
          
          return newExpense;
        } catch (error) {
          set({ error: 'Failed to create expense', isLoading: false });
          console.error('Error creating expense:', error);
          return null;
        }
      },
      getFilteredExpenses: (groupId) => {
        const { filters } = get();
        let expensesToFilter: Expense[];
        
        if (groupId) {
          expensesToFilter = get().groupExpenses[groupId] || [];
        } else {
          expensesToFilter = get().expenses;
        }
        
        return expensesToFilter.filter((expense) => {
          // Filter by search query
          if (filters.searchQuery && !expense.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
            return false;
          }
          
          // Filter by amount range
          if (filters.minAmount !== null && expense.amount < filters.minAmount) {
            return false;
          }
          
          if (filters.maxAmount !== null && expense.amount > filters.maxAmount) {
            return false;
          }
          
          // Filter by paid by
          if (filters.paidBy !== null && expense.paid_by !== filters.paidBy) {
            return false;
          }
          
          // Filter by date range
          if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
            const expenseDate = new Date(expense.created_at);
            if (expenseDate < filters.dateRange.start || expenseDate > filters.dateRange.end) {
              return false;
            }
          }
          
          return true;
        });
      },
    })
  )
);

// Balances Store
interface BalancesState {
  groupBalances: Record<number, GroupBalance>;
  userBalance: UserBalance | null;
  isLoading: boolean;
  error: string | null;
  setGroupBalance: (groupId: number, balance: GroupBalance) => void;
  setUserBalance: (balance: UserBalance) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchGroupBalance: (groupId: number) => Promise<void>;
  fetchUserBalance: (userId: number) => Promise<void>;
}

export const useBalancesStore = create<BalancesState>()(
  devtools(
    (set) => ({
      groupBalances: {},
      userBalance: null,
      isLoading: false,
      error: null,
      setGroupBalance: (groupId, balance) => 
        set((state) => ({
          groupBalances: {
            ...state.groupBalances,
            [groupId]: balance,
          },
        })),
      setUserBalance: (balance) => set({ userBalance: balance }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      fetchGroupBalance: async (groupId) => {
        try {
          set({ isLoading: true, error: null });
          const balance = await balancesApi.getByGroupId(groupId);
          set((state) => ({
            groupBalances: {
              ...state.groupBalances,
              [groupId]: balance,
            },
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to fetch group balance', isLoading: false });
          console.error('Error fetching group balance:', error);
        }
      },
      fetchUserBalance: async (userId) => {
        try {
          set({ isLoading: true, error: null });
          const balance = await balancesApi.getByUserId(userId);
          set({ userBalance: balance, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch user balance', isLoading: false });
          console.error('Error fetching user balance:', error);
        }
      },
    })
  )
);

// UI Store for managing UI state
interface UIState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  isLoading: boolean;
  notifications: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setActiveModal: (modalId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarCollapsed: false,
        activeModal: null,
        isLoading: false,
        notifications: [],
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setActiveModal: (modalId) => set({ activeModal: modalId }),
        setLoading: (isLoading) => set({ isLoading }),
        addNotification: (message, type) => 
          set((state) => ({
            notifications: [
              ...state.notifications,
              { id: `${Date.now()}`, message, type },
            ],
          })),
        removeNotification: (id) => 
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),
        clearNotifications: () => set({ notifications: [] }),
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
      }
    )
  )
);

// Report Store for analytics and reports
interface ReportState {
  expensesByCategory: Record<string, number>;
  expensesByMonth: Record<string, number>;
  expensesByUser: Record<number, number>;
  isLoading: boolean;
  error: string | null;
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  generateReports: (groupId?: number) => void;
}

export const useReportStore = create<ReportState>()(
  devtools(
    (set, get) => ({
      expensesByCategory: {},
      expensesByMonth: {},
      expensesByUser: {},
      isLoading: false,
      error: null,
      dateRange: { start: null, end: null },
      setDateRange: (range) => set({ dateRange: range }),
      generateReports: (groupId) => {
        set({ isLoading: true });
        
        try {
          // Get expenses to analyze
          const expenses = useExpensesStore.getState().getFilteredExpenses(groupId);
          const dateRange = get().dateRange;
          
          // Filter by date range if provided
          const filteredExpenses = dateRange.start && dateRange.end 
            ? expenses.filter(expense => {
                const date = new Date(expense.created_at);
                return date >= dateRange.start! && date <= dateRange.end!;
              })
            : expenses;
          
          // Calculate expenses by category
          const byCategory: Record<string, number> = {};
          // Calculate expenses by month
          const byMonth: Record<string, number> = {};
          // Calculate expenses by user
          const byUser: Record<number, number> = {};
          
          filteredExpenses.forEach(expense => {
            // For demo, using description as category
            // In a real app, you'd have a category field
            const category = expense.description.split(' ')[0];
            byCategory[category] = (byCategory[category] || 0) + expense.amount;
            
            // Group by month
            const date = new Date(expense.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            byMonth[monthKey] = (byMonth[monthKey] || 0) + expense.amount;
            
            // Group by user who paid
            byUser[expense.paid_by] = (byUser[expense.paid_by] || 0) + expense.amount;
          });
          
          set({
            expensesByCategory: byCategory,
            expensesByMonth: byMonth,
            expensesByUser: byUser,
            isLoading: false,
          });
        } catch (error) {
          set({ error: 'Failed to generate reports', isLoading: false });
          console.error('Error generating reports:', error);
        }
      },
    })
  )
);
