"use client"
import { useState } from "react";
import { Balance } from "@/lib/types";
import { Loader2, Filter, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import BalanceCard from "./BalanceCard";
import { cn } from "@/lib/utils";

interface BalanceListProps {
  balances: Balance[];
  currentUserId?: number;
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  title?: string;
  showFilters?: boolean;
  className?: string;
  onBalanceClick?: (balance: Balance) => void;
}

const BalanceList = ({
  balances,
  currentUserId = 1,
  isLoading = false,
  error = null,
  emptyMessage = "No balances found",
  title = "Balances",
  showFilters = false,
  className = "",
  onBalanceClick
}: BalanceListProps) => {
  // State for filters
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "owed" | "owing">("all");
  
  // Filter balances based on selected filter
  const filteredBalances = balances.filter(balance => {
    if (filterType === "all") return true;
    if (filterType === "owed") return balance.to_user_id === currentUserId;
    if (filterType === "owing") return balance.from_user_id === currentUserId;
    return true;
  });

  // Toggle filter panel
  const toggleFilters = () => {
    setFilterExpanded(!filterExpanded);
  };

  // Handle filter change
  const handleFilterChange = (type: "all" | "owed" | "owing") => {
    setFilterType(type);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 size={32} className="animate-spin text-[#1cc29f] mb-4" />
        <p className="text-gray-500">Loading balances...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
        <AlertCircle size={20} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-red-800">Error loading balances</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with title and filter toggle */}
      {(title || showFilters) && (
        <div className="flex items-center justify-between">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          
          {showFilters && (
            <button
              onClick={toggleFilters}
              className="flex items-center text-gray-600 hover:text-gray-900 text-sm"
            >
              <Filter size={16} className="mr-1" />
              Filters
              {filterExpanded ? (
                <ChevronUp size={16} className="ml-1" />
              ) : (
                <ChevronDown size={16} className="ml-1" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Filter panel */}
      {showFilters && filterExpanded && (
        <div className="bg-gray-50 rounded-lg p-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange("all")}
            className={cn(
              "px-3 py-1 rounded-full text-sm",
              filterType === "all"
                ? "bg-[#1cc29f] text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            )}
          >
            All Balances
          </button>
          <button
            onClick={() => handleFilterChange("owed")}
            className={cn(
              "px-3 py-1 rounded-full text-sm",
              filterType === "owed"
                ? "bg-[#1cc29f] text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            )}
          >
            Owed to me
          </button>
          <button
            onClick={() => handleFilterChange("owing")}
            className={cn(
              "px-3 py-1 rounded-full text-sm",
              filterType === "owing"
                ? "bg-[#1cc29f] text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            )}
          >
            I owe
          </button>
        </div>
      )}

      {/* Balances list */}
      {filteredBalances.length > 0 ? (
        <div className="space-y-3">
          {filteredBalances.map((balance, index) => (
            <BalanceCard
              key={`${balance.from_user_id}-${balance.to_user_id}-${index}`}
              balance={balance}
              currentUserId={currentUserId}
              onClick={onBalanceClick ? () => onBalanceClick(balance) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default BalanceList;
