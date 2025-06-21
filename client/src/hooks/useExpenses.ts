"use client"
import { useCallback } from 'react';
import { useExpensesStore } from '@/store';
import { Expense, SplitType } from '@/lib/types';

export const useExpenses = (groupId?: number) => {
  // Get state and actions from the expenses store
  const {
    expenses,
    groupExpenses,
    isLoading,
    error,
    filters,
    fetchExpensesByGroupId,
    createExpense,
    setFilters,
    resetFilters,
    getFilteredExpenses,
    setError
  } = useExpensesStore();

  // Get expenses for the current group (if groupId is provided)
  const currentGroupExpenses = groupId ? groupExpenses[groupId] || [] : expenses;
  
  // Get filtered expenses based on current filters
  const filteredExpenses = getFilteredExpenses(groupId);

  // Fetch expenses for a specific group
  const loadGroupExpenses = useCallback(async (gId: number) => {
    await fetchExpensesByGroupId(gId);
  }, [fetchExpensesByGroupId]);

  // Create a new expense
  const addExpense = useCallback(async (expenseData: {
    group_id: number;
    description: string;
    amount: number;
    paid_by: number;
    split_type: SplitType;
    splits: { user_id: number; amount?: number; percentage?: number }[];
  }): Promise<Expense | null> => {
    return await createExpense(expenseData);
  }, [createExpense]);

  // Apply filters to expenses
  const applyFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);
  }, [setFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Calculate total amount for filtered expenses
  const calculateTotalAmount = useCallback(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  // Get expenses paid by a specific user
  const getExpensesByUser = useCallback((userId: number) => {
    return filteredExpenses.filter(expense => expense.paid_by === userId);
  }, [filteredExpenses]);

  // Calculate how much a user has paid in total
  const calculateUserPaidTotal = useCallback((userId: number) => {
    return getExpensesByUser(userId).reduce((sum, expense) => sum + expense.amount, 0);
  }, [getExpensesByUser]);

  // Calculate how much a user owes or is owed across all filtered expenses
  const calculateUserBalance = useCallback((userId: number) => {
    let totalPaid = 0;
    let totalOwed = 0;

    filteredExpenses.forEach(expense => {
      // If user paid for this expense
      if (expense.paid_by === userId) {
        totalPaid += expense.amount;
      }

      // Find how much this user owes for this expense
      const userSplit = expense.splits.find(split => split.user_id === userId);
      if (userSplit) {
        totalOwed += userSplit.amount || 0;
      }
    });

    return totalPaid - totalOwed;
  }, [filteredExpenses]);

  // Group expenses by date (for timeline views)
  const getExpensesByDate = useCallback(() => {
    const grouped: Record<string, Expense[]> = {};
    
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.created_at).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(expense);
    });
    
    return grouped;
  }, [filteredExpenses]);

  return {
    expenses: currentGroupExpenses,
    filteredExpenses,
    isLoading,
    error,
    filters,
    loadGroupExpenses,
    addExpense,
    applyFilters,
    clearFilters,
    clearError,
    calculateTotalAmount,
    getExpensesByUser,
    calculateUserPaidTotal,
    calculateUserBalance,
    getExpensesByDate
  };
};
