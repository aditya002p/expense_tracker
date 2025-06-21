"use client";

import { useState, useEffect } from "react";
import { useExpensesStore, useGroupsStore, useUserStore } from "@/store";
import { 
  Clock, 
  Filter, 
  Search, 
  SortDesc, 
  SortAsc, 
  Loader2, 
  Calendar, 
  CreditCard 
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Expense } from "@/lib/types";
import Link from "next/link";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export default function ActivityPage() {
  // Get data from stores
  const { expenses, isLoading: isExpensesLoading, filters, setFilters } = useExpensesStore();
  const { groups, isLoading: isGroupsLoading } = useGroupsStore();
  const { users } = useUserStore();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  // Apply filters and sorting to expenses
  useEffect(() => {
    let result = [...expenses];
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(expense => 
        expense.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by group
    if (selectedGroupId !== "all") {
      result = result.filter(expense => expense.group_id === parseInt(selectedGroupId));
    }
    
    // Filter by date range
    if (dateRange.start && dateRange.end) {
      result = result.filter(expense => {
        const expenseDate = new Date(expense.created_at);
        return expenseDate >= dateRange.start! && expenseDate <= dateRange.end!;
      });
    }
    
    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredExpenses(result);
  }, [expenses, searchQuery, selectedGroupId, sortOrder, dateRange]);
  
  // Toggle filter panel
  const toggleFilterPanel = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  
  // Handle date range selection
  const handleDateRangeChange = (field: "start" | "end", date: Date | null) => {
    setDateRange(prev => ({
      ...prev,
      [field]: date
    }));
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedGroupId("all");
    setDateRange({ start: null, end: null });
  };
  
  // Group expenses by date for timeline display
  const groupExpensesByDate = () => {
    const grouped: Record<string, Expense[]> = {};
    
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.created_at).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(expense);
    });
    
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => {
        return sortOrder === "asc" 
          ? dateA.localeCompare(dateB) 
          : dateB.localeCompare(dateA);
      });
  };
  
  // Get group name by ID
  const getGroupName = (groupId: number) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : `Group ${groupId}`;
  };
  
  // Get user name by ID
  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return userId === 1 ? "You" : (user ? user.name : `User ${userId}`);
  };
  
  // Format date for display
  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return "Any date";
    return formatDate(date.toISOString(), 'short');
  };
  
  // Loading state
  const isLoading = isExpensesLoading || isGroupsLoading;
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Activity</h1>
        <p className="text-gray-500">
          View your recent expense history and activity
        </p>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          {/* Search Input */}
          <div className="relative flex-grow">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Group Filter */}
          <div className="w-full md:w-48">
            <Select
              value={selectedGroupId}
              onValueChange={setSelectedGroupId}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
          >
            {sortOrder === "asc" ? (
              <SortAsc size={18} />
            ) : (
              <SortDesc size={18} />
            )}
          </Button>
          
          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={toggleFilterPanel}
            className="flex items-center"
          >
            <Filter size={18} className="mr-2" />
            Filters
          </Button>
        </div>
        
        {/* Expanded Filter Panel */}
        {isFilterExpanded && (
          <div className="pt-4 border-t border-gray-200 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Date Range Filter */}
              <div className="space-y-2 flex-grow">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar size={16} className="mr-2" />
                        {formatDateForDisplay(dateRange.start)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateRange.start || undefined}
                        onSelect={(date) => handleDateRangeChange("start", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar size={16} className="mr-2" />
                        {formatDateForDisplay(dateRange.end)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateRange.end || undefined}
                        onSelect={(date) => handleDateRangeChange("end", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            {/* Filter Actions */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="mr-2"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Activity Timeline */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={40} className="animate-spin text-[#1cc29f] mb-4" />
          <p className="text-gray-500">Loading activity...</p>
        </div>
      ) : filteredExpenses.length > 0 ? (
        <div className="space-y-8">
          {groupExpensesByDate().map(([date, expenses]) => (
            <div key={date} className="relative">
              {/* Date Header */}
              <div className="sticky top-0 bg-gray-50 z-10 rounded-lg p-2 mb-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#e4f9f5] flex items-center justify-center text-[#1cc29f] mr-3">
                  <Calendar size={18} />
                </div>
                <h3 className="font-medium">
                  {formatDate(new Date(date).toISOString(), 'long')}
                </h3>
              </div>
              
              {/* Expenses for this date */}
              <div className="space-y-4 pl-5 border-l-2 border-gray-100">
                {expenses.map((expense) => (
                  <div 
                    key={expense.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow ml-5 relative"
                  >
                    {/* Timeline dot */}
                    <div className="absolute w-4 h-4 rounded-full bg-[#1cc29f] left-0 top-1/2 transform -translate-x-[14px] -translate-y-1/2"></div>
                    
                    {/* Expense content */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-[#e4f9f5] flex items-center justify-center text-[#1cc29f] mr-3">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <h4 className="font-medium">{expense.description}</h4>
                          <p className="text-sm text-gray-500">
                            {getUserName(expense.paid_by)} paid in{" "}
                            <Link 
                              href={`/groups/${expense.group_id}`} 
                              className="text-[#1cc29f] hover:underline"
                            >
                              {getGroupName(expense.group_id)}
                            </Link>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(expense.created_at, 'relative')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{formatCurrency(expense.amount)}</span>
                        <p className="text-xs text-gray-500 mt-1">
                          {expense.split_type === 'equal' ? 'Split equally' : 'Split by percentage'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Clock size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No activity found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || selectedGroupId !== "all" || (dateRange.start && dateRange.end)
              ? "Try changing your filters to see more results."
              : "You don't have any expense activity yet."}
          </p>
          <Link href="/groups" className="btn-primary inline-flex">
            Go to Groups
          </Link>
        </div>
      )}
    </div>
  );
}
