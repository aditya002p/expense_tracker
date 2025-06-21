"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Search, Filter, SortAsc, SortDesc, Loader2 } from "lucide-react";
import { Group } from "@/lib/types";
import { groupsApi } from "@/lib/api";
import GroupList from "@/components/groups/GroupList";

// Mock data for demonstration
const mockGroups: Group[] = [
  { 
    id: 1, 
    name: "Roommates", 
    members: [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
      { id: 3, name: "Alex Johnson", email: "alex@example.com" },
    ],
    created_at: "2025-01-15T10:30:00Z",
    total_expenses: 2450.50
  },
  { 
    id: 2, 
    name: "Goa Trip", 
    members: [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
      { id: 4, name: "Sarah Miller", email: "sarah@example.com" },
      { id: 5, name: "Michael Brown", email: "michael@example.com" },
      { id: 6, name: "Emily Davis", email: "emily@example.com" },
    ],
    created_at: "2025-03-22T14:15:00Z",
    total_expenses: 15750.75
  },
  { 
    id: 3, 
    name: "Office Lunch", 
    members: [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 3, name: "Alex Johnson", email: "alex@example.com" },
      { id: 4, name: "Sarah Miller", email: "sarah@example.com" },
      { id: 5, name: "Michael Brown", email: "michael@example.com" },
      { id: 6, name: "Emily Davis", email: "emily@example.com" },
      { id: 7, name: "David Wilson", email: "david@example.com" },
      { id: 8, name: "Lisa Taylor", email: "lisa@example.com" },
    ],
    created_at: "2025-05-10T12:45:00Z",
    total_expenses: 3200.00
  },
  { 
    id: 4, 
    name: "Weekend Getaway", 
    members: [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
      { id: 4, name: "Sarah Miller", email: "sarah@example.com" },
    ],
    created_at: "2025-06-05T09:20:00Z",
    total_expenses: 8500.25
  },
  { 
    id: 5, 
    name: "Monthly Bills", 
    members: [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 3, name: "Alex Johnson", email: "alex@example.com" },
    ],
    created_at: "2025-02-01T16:30:00Z",
    total_expenses: 5600.00
  }
];

type SortOption = "name" | "date" | "expenses";
type SortDirection = "asc" | "desc";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        // const groups = await groupsApi.getAll();
        
        // Using mock data for demonstration
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        setGroups(mockGroups);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Filter and sort groups when search query or sort options change
  useEffect(() => {
    let result = [...groups];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "name") {
        return sortDirection === "asc" 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "date") {
        return sortDirection === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "expenses") {
        const aExpenses = a.total_expenses || 0;
        const bExpenses = b.total_expenses || 0;
        return sortDirection === "asc" 
          ? aExpenses - bExpenses 
          : bExpenses - aExpenses;
      }
      return 0;
    });
    
    setFilteredGroups(result);
  }, [groups, searchQuery, sortBy, sortDirection]);

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Your Groups</h1>
        <Link 
          href="/groups/create" 
          className="btn-primary inline-flex items-center justify-center sm:w-auto w-full"
        >
          <PlusCircle size={18} className="mr-2" />
          Create a new group
        </Link>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search groups by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-10 w-full"
          />
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="form-input bg-white"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="expenses">Sort by Expenses</option>
          </select>
          
          <button
            onClick={toggleSortDirection}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            aria-label={sortDirection === "asc" ? "Sort descending" : "Sort ascending"}
          >
            {sortDirection === "asc" ? (
              <SortAsc size={20} className="text-gray-700" />
            ) : (
              <SortDesc size={20} className="text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Groups List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={40} className="animate-spin text-[#1cc29f] mb-4" />
          <p className="text-gray-500">Loading your groups...</p>
        </div>
      ) : (
        <>
          {/* Results count */}
          <p className="text-gray-500">
            {filteredGroups.length === 0
              ? "No groups found"
              : filteredGroups.length === 1
              ? "1 group found"
              : `${filteredGroups.length} groups found`}
            {searchQuery && ` for "${searchQuery}"`}
          </p>

          {/* Group List Component */}
          <GroupList 
            groups={filteredGroups} 
            showCreateButton={filteredGroups.length === 0}
            emptyMessage={
              searchQuery
                ? `No groups found matching "${searchQuery}". Try a different search term or create a new group.`
                : "You don't have any groups yet. Create your first group to start tracking expenses."
            }
          />
        </>
      )}
    </div>
  );
}
