"use client"
import { UserBalance } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface BalanceSummaryProps {
  userBalance: UserBalance | null;
  groupId?: number;
  isLoading?: boolean;
  error?: string | null;
  showDetails?: boolean;
  className?: string;
}

const BalanceSummary = ({
  userBalance,
  groupId,
  isLoading = false,
  error = null,
  showDetails = true,
  className = ""
}: BalanceSummaryProps) => {
  // Loading state
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center py-6 ${className}`}>
        <Loader2 size={32} className="animate-spin text-[#1cc29f] mb-4" />
        <p className="text-gray-500">Loading balance summary...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 flex items-start ${className}`}>
        <AlertCircle size={20} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-red-800">Error loading balance summary</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!userBalance) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 text-center ${className}`}>
        <p className="text-gray-500">No balance information available</p>
      </div>
    );
  }

  // Calculate the percentage for the progress bar
  const totalTransactions = userBalance.total_owed + userBalance.total_owes;
  const owedPercentage = totalTransactions > 0 
    ? (userBalance.total_owed / totalTransactions) * 100 
    : 50; // Default to 50% if no transactions

  // Filter group balances if groupId is provided
  const relevantGroupBalances = groupId
    ? userBalance.group_balances.filter(gb => gb.group_id === groupId)
    : userBalance.group_balances;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Balance Summary</h2>
      
      {/* Net Balance */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-500 mb-1">Net Balance</p>
          <div className="flex items-center">
            {userBalance.net_balance >= 0 ? (
              <TrendingUp size={20} className="text-green-500 mr-2" />
            ) : (
              <TrendingDown size={20} className="text-red-500 mr-2" />
            )}
            <p className={cn(
              "text-2xl font-bold",
              userBalance.net_balance >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {formatCurrency(Math.abs(userBalance.net_balance))}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {userBalance.net_balance >= 0 
              ? "Overall, you are owed money" 
              : "Overall, you owe money"}
          </p>
        </div>
        
        {/* Visual indicator */}
        <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center">
          <DollarSign 
            size={24} 
            className={userBalance.net_balance >= 0 ? "text-green-500" : "text-red-500"} 
          />
        </div>
      </div>
      
      {/* Balance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Total Owed */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-500 text-sm mb-1">Total owed to you</p>
          <p className="text-xl font-semibold text-green-500">
            {formatCurrency(userBalance.total_owed)}
          </p>
        </div>
        
        {/* Total Owes */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-500 text-sm mb-1">Total you owe</p>
          <p className="text-xl font-semibold text-red-500">
            {formatCurrency(userBalance.total_owes)}
          </p>
        </div>
      </div>
      
      {/* Balance Distribution */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>You are owed</span>
          <span>You owe</span>
        </div>
        <div className="relative h-2 w-full">
          <Progress value={owedPercentage} className="h-2" />
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-green-500">{formatCurrency(userBalance.total_owed)}</span>
          <span className="text-red-500">{formatCurrency(userBalance.total_owes)}</span>
        </div>
      </div>
      
      {/* Group Balances */}
      {showDetails && relevantGroupBalances.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Group Balances</h3>
          <div className="space-y-3">
            {relevantGroupBalances.map((groupBalance) => {
              // Calculate net balance for this group
              const groupNetBalance = groupBalance.balances.reduce((net, balance) => {
                if (balance.to_user_id === 1) {
                  // Money owed to current user
                  return net + balance.amount;
                } else if (balance.from_user_id === 1) {
                  // Money current user owes
                  return net - balance.amount;
                }
                return net;
              }, 0);
              
              return (
                <div 
                  key={groupBalance.group_id} 
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{groupBalance.group_name}</p>
                    <p className="text-sm text-gray-500">
                      {groupBalance.balances.length} active {groupBalance.balances.length === 1 ? 'balance' : 'balances'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className={cn(
                      "font-medium",
                      groupNetBalance > 0 ? "text-green-500" : 
                      groupNetBalance < 0 ? "text-red-500" : "text-gray-500"
                    )}>
                      {formatCurrency(Math.abs(groupNetBalance))}
                    </p>
                    <ArrowRight size={16} className="ml-2 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* No group balances */}
      {showDetails && relevantGroupBalances.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500">No group balances found</p>
        </div>
      )}
    </div>
  );
};

export default BalanceSummary;
