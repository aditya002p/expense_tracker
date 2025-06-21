/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useExpensesStore } from "@/store";
import { User } from "@/lib/types";
import { 
  Calendar, 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  DollarSign
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Slider 
} from "@/components/ui/slider";
import { 
  Calendar as CalendarComponent 
} from "@/components/ui/calendar";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Input 
} from "@/components/ui/input";

interface ExpenseFiltersProps {
  groupMembers?: User[];
  maxAmount?: number;
  className?: string;
  onFiltersChange?: () => void;
}

const ExpenseFilters = ({
  groupMembers = [],
  maxAmount = 10000,
  className = "",
  onFiltersChange
}: ExpenseFiltersProps) => {
  const { filters, setFilters, resetFilters } = useExpensesStore();
  
  // Local state for filter panel visibility
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Local state for filter values (to avoid immediate updates)
  const [localFilters, setLocalFilters] = useState({
    dateRange: filters.dateRange,
    minAmount: filters.minAmount || 0,
    maxAmount: filters.maxAmount || maxAmount,
    paidBy: filters.paidBy,
    searchQuery: filters.searchQuery || ""
  });
  
  // Number of active filters
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  // Update local filters when store filters change
  useEffect(() => {
    setLocalFilters({
      dateRange: filters.dateRange,
      minAmount: filters.minAmount || 0,
      maxAmount: filters.maxAmount || maxAmount,
      paidBy: filters.paidBy,
      searchQuery: filters.searchQuery || ""
    });
  }, [filters, maxAmount]);
  
  // Calculate active filter count
  useEffect(() => {
    let count = 0;
    if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) count++;
    if (filters.minAmount !== null || filters.maxAmount !== null) count++;
    if (filters.paidBy !== null) count++;
    if (filters.searchQuery) count++;
    setActiveFilterCount(count);
  }, [filters]);
  
  // Toggle filter panel visibility
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Update local filter state
  const updateLocalFilter = (key: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Apply all filters to the store
  const applyFilters = () => {
    setFilters({
      dateRange: localFilters.dateRange,
      minAmount: localFilters.minAmount > 0 ? localFilters.minAmount : null,
      maxAmount: localFilters.maxAmount < maxAmount ? localFilters.maxAmount : null,
      paidBy: localFilters.paidBy,
      searchQuery: localFilters.searchQuery
    });
    
    if (onFiltersChange) {
      onFiltersChange();
    }
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    resetFilters();
    setLocalFilters({
      dateRange: null,
      minAmount: 0,
      maxAmount: maxAmount,
      paidBy: null,
      searchQuery: ""
    });
    
    if (onFiltersChange) {
      onFiltersChange();
    }
  };
  
  // Handle search input (apply immediately)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    updateLocalFilter("searchQuery", query);
    
    // Debounce search to avoid too many updates
    const timer = setTimeout(() => {
      setFilters({ searchQuery: query });
      if (onFiltersChange) {
        onFiltersChange();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  };
  
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };
  
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Filter Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex items-center">
          <Filter size={18} className="text-gray-500 mr-2" />
          <h3 className="font-medium">
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-[#e4f9f5] text-[#1cc29f]">
                {activeFilterCount}
              </Badge>
            )}
          </h3>
        </div>
        <button className="text-gray-500">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      
      {/* Search Bar (Always Visible) */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search expenses..."
            value={localFilters.searchQuery}
            onChange={handleSearchChange}
            className="pl-10 w-full"
          />
        </div>
      </div>
      
      {/* Expandable Filter Panel */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-6">
          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="justify-start text-left font-normal flex-1"
                  >
                    <Calendar size={16} className="mr-2 text-gray-500" />
                    {localFilters.dateRange?.start ? 
                      formatDate(localFilters.dateRange.start) : 
                      "Start date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={localFilters.dateRange?.start || undefined}
                    onSelect={(date) => updateLocalFilter("dateRange", {
                      start: date,
                      end: localFilters.dateRange?.end || null
                    })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="justify-start text-left font-normal flex-1"
                  >
                    <Calendar size={16} className="mr-2 text-gray-500" />
                    {localFilters.dateRange?.end ? 
                      formatDate(localFilters.dateRange.end) : 
                      "End date"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={localFilters.dateRange?.end || undefined}
                    onSelect={(date) => updateLocalFilter("dateRange", {
                      start: localFilters.dateRange?.start || null,
                      end: date
                    })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Amount Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Range: {formatCurrency(localFilters.minAmount)} - {formatCurrency(localFilters.maxAmount)}
            </label>
            <div className="pt-2 px-2">
              <Slider
                defaultValue={[localFilters.minAmount, localFilters.maxAmount]}
                min={0}
                max={maxAmount}
                step={100}
                value={[localFilters.minAmount, localFilters.maxAmount]}
                onValueChange={(values) => {
                  updateLocalFilter("minAmount", values[0]);
                  updateLocalFilter("maxAmount", values[1]);
                }}
                className="mt-2"
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>{formatCurrency(0)}</span>
              <span>{formatCurrency(maxAmount)}</span>
            </div>
          </div>
          
          {/* Paid By Filter */}
          {groupMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paid By
              </label>
              <Select
                value={localFilters.paidBy?.toString() || ""}
                onValueChange={(value) => updateLocalFilter("paidBy", value ? Number(value) : null)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any member</SelectItem>
                  {groupMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.id === 1 ? "You" : member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Filter Actions */}
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-gray-600"
            >
              <X size={16} className="mr-1" />
              Reset
            </Button>
            
            <Button
              size="sm"
              onClick={applyFilters}
              className="bg-[#1cc29f] hover:bg-[#18b090] text-white"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
      
      {/* Active Filters Display */}
      {activeFilterCount > 0 && !isExpanded && (
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {filters.dateRange && (filters.dateRange.start || filters.dateRange.end) && (
            <Badge variant="outline" className="flex items-center gap-1 bg-gray-50">
              <Calendar size={12} />
              {filters.dateRange.start ? formatDate(filters.dateRange.start) : "Any"} 
              {" - "} 
              {filters.dateRange.end ? formatDate(filters.dateRange.end) : "Any"}
              <X 
                size={12} 
                className="ml-1 cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters({ dateRange: null });
                  if (onFiltersChange) onFiltersChange();
                }} 
              />
            </Badge>
          )}
          
          {(filters.minAmount !== null || filters.maxAmount !== null) && (
            <Badge variant="outline" className="flex items-center gap-1 bg-gray-50">
              <DollarSign size={12} />
              {filters.minAmount !== null ? formatCurrency(filters.minAmount) : formatCurrency(0)} 
              {" - "} 
              {filters.maxAmount !== null ? formatCurrency(filters.maxAmount) : formatCurrency(maxAmount)}
              <X 
                size={12} 
                className="ml-1 cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters({ minAmount: null, maxAmount: null });
                  if (onFiltersChange) onFiltersChange();
                }} 
              />
            </Badge>
          )}
          
          {filters.paidBy !== null && (
            <Badge variant="outline" className="flex items-center gap-1 bg-gray-50">
              Paid by: {groupMembers.find(m => m.id === filters.paidBy)?.name || `User ${filters.paidBy}`}
              <X 
                size={12} 
                className="ml-1 cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  setFilters({ paidBy: null });
                  if (onFiltersChange) onFiltersChange();
                }} 
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseFilters;
