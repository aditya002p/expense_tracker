
"use client"
import { useCallback, useEffect } from 'react';
import { useGroupsStore } from '@/store';
import { Group } from '@/lib/types';

export const useGroups = () => {
  // Get state and actions from the groups store
  const {
    groups,
    selectedGroup,
    isLoading,
    error,
    fetchGroups,
    fetchGroupById,
    createGroup,
    addMemberToGroup,
    setSelectedGroup,
    setError
  } = useGroupsStore();

  // Fetch all groups on initial load
  const loadGroups = useCallback(async () => {
    await fetchGroups();
  }, [fetchGroups]);

  // Get a specific group by ID
  const getGroupById = useCallback(async (groupId: number) => {
    await fetchGroupById(groupId);
  }, [fetchGroupById]);

  // Create a new group
  const createNewGroup = useCallback(async (name: string, memberIds: number[]): Promise<Group | null> => {
    return await createGroup(name, memberIds);
  }, [createGroup]);

  // Add a member to a group
  const addMember = useCallback(async (groupId: number, userId: number) => {
    await addMemberToGroup(groupId, userId);
  }, [addMemberToGroup]);

  // Clear the selected group
  const clearSelectedGroup = useCallback(() => {
    setSelectedGroup(null);
  }, [setSelectedGroup]);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Check if a user is a member of a group
  const isUserInGroup = useCallback((groupId: number, userId: number): boolean => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return false;
    return group.members.some(member => member.id === userId);
  }, [groups]);

  // Get all groups a user is a member of
  const getUserGroups = useCallback((userId: number): Group[] => {
    return groups.filter(group => 
      group.members.some(member => member.id === userId)
    );
  }, [groups]);

  return {
    groups,
    selectedGroup,
    isLoading,
    error,
    loadGroups,
    getGroupById,
    createNewGroup,
    addMember,
    clearSelectedGroup,
    clearError,
    isUserInGroup,
    getUserGroups
  };
};
