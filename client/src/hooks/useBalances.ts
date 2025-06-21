"use client"
import { useCallback } from 'react';
import { useBalancesStore } from '@/store';
import { Balance, GroupBalance } from '@/lib/types';

export const useBalances = (groupId?: number) => {
  // Get state and actions from the balances store
  const {
    groupBalances,
    userBalance,
    isLoading,
    error,
    fetchGroupBalance,
    fetchUserBalance,
    setError
  } = useBalancesStore();

  // Get balances for a specific group if groupId is provided
  const currentGroupBalance = groupId ? groupBalances[groupId] : null;

  // Fetch balances for a specific group
  const loadGroupBalance = useCallback(async (gId: number) => {
    await fetchGroupBalance(gId);
  }, [fetchGroupBalance]);

  // Fetch balances for the current user
  const loadUserBalance = useCallback(async (userId: number) => {
    await fetchUserBalance(userId);
  }, [fetchUserBalance]);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Get all balances where a specific user is involved (either owes or is owed)
  const getUserBalances = useCallback((userId: number): Balance[] => {
    if (!groupId || !groupBalances[groupId]) return [];
    
    return groupBalances[groupId].balances.filter(
      balance => balance.from_user_id === userId || balance.to_user_id === userId
    );
  }, [groupId, groupBalances]);

  // Calculate how much a user owes in total for a specific group
  const calculateUserOwes = useCallback((userId: number): number => {
    if (!groupId || !groupBalances[groupId]) return 0;
    
    return groupBalances[groupId].balances
      .filter(balance => balance.from_user_id === userId)
      .reduce((sum, balance) => sum + balance.amount, 0);
  }, [groupId, groupBalances]);

  // Calculate how much is owed to a user in total for a specific group
  const calculateUserOwed = useCallback((userId: number): number => {
    if (!groupId || !groupBalances[groupId]) return 0;
    
    return groupBalances[groupId].balances
      .filter(balance => balance.to_user_id === userId)
      .reduce((sum, balance) => sum + balance.amount, 0);
  }, [groupId, groupBalances]);

  // Calculate net balance for a user in a specific group
  const calculateUserNetBalance = useCallback((userId: number): number => {
    return calculateUserOwed(userId) - calculateUserOwes(userId);
  }, [calculateUserOwed, calculateUserOwes]);

  // Get all users who owe the specified user
  const getUsersWhoOwe = useCallback((userId: number): { userId: number, userName: string, amount: number }[] => {
    if (!groupId || !groupBalances[groupId]) return [];
    
    return groupBalances[groupId].balances
      .filter(balance => balance.to_user_id === userId)
      .map(balance => ({
        userId: balance.from_user_id,
        userName: balance.from_user_name || `User ${balance.from_user_id}`,
        amount: balance.amount
      }));
  }, [groupId, groupBalances]);

  // Get all users who the specified user owes
  const getUsersOwedTo = useCallback((userId: number): { userId: number, userName: string, amount: number }[] => {
    if (!groupId || !groupBalances[groupId]) return [];
    
    return groupBalances[groupId].balances
      .filter(balance => balance.from_user_id === userId)
      .map(balance => ({
        userId: balance.to_user_id,
        userName: balance.to_user_name || `User ${balance.to_user_id}`,
        amount: balance.amount
      }));
  }, [groupId, groupBalances]);

  // Get simplified settlement plan (who should pay whom to settle all debts)
  const getSettlementPlan = useCallback((): { fromId: number, fromName: string, toId: number, toName: string, amount: number }[] => {
    if (!groupId || !groupBalances[groupId]) return [];
    
    // In a real app, you'd implement a more sophisticated algorithm to minimize the number of transactions
    // For now, we'll just return the existing balances as the settlement plan
    return groupBalances[groupId].balances.map(balance => ({
      fromId: balance.from_user_id,
      fromName: balance.from_user_name || `User ${balance.from_user_id}`,
      toId: balance.to_user_id,
      toName: balance.to_user_name || `User ${balance.to_user_id}`,
      amount: balance.amount
    }));
  }, [groupId, groupBalances]);

  return {
    groupBalance: currentGroupBalance,
    userBalance,
    isLoading,
    error,
    loadGroupBalance,
    loadUserBalance,
    clearError,
    getUserBalances,
    calculateUserOwes,
    calculateUserOwed,
    calculateUserNetBalance,
    getUsersWhoOwe,
    getUsersOwedTo,
    getSettlementPlan
  };
};
