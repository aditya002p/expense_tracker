"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Loader2, 
  CreditCard, 
  Users, 
  AlertCircle 
} from "lucide-react";
import { Group, Expense, Balance } from "@/lib/types";
import { useGroupsStore, useExpensesStore, useBalancesStore, useUserStore } from "@/store";
import GroupDetails from "@/components/groups/GroupDetails";
import ExpenseList from "@/components/expenses/ExpenseList";

export default function GroupDetailsPage() {
  const params = useParams();
  const groupId = Number(params.id);
  
  // Get state and actions from Zustand stores
  const { selectedGroup, isLoading: isGroupLoading, error: groupError, fetchGroupById } = useGroupsStore();
  const { groupExpenses, isLoading: isExpensesLoading, error: expensesError, fetchExpensesByGroupId } = useExpensesStore();
  const { groupBalances, isLoading: isBalancesLoading, error: balancesError, fetchGroupBalance } = useBalancesStore();
  const { currentUser } = useUserStore();

  const [totalExpenses, setTotalExpenses] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Fetch group data, expenses, and balances on component mount or groupId change
  useEffect(() => {
    if (!groupId) return;

    const fetchData = async () => {
      try {
        setFetchError(null);
        await fetchGroupById(groupId);
        await fetchExpensesByGroupId(groupId);
        await fetchGroupBalance(groupId);
      } catch (error) {
        console.error("Error fetching group data:", error);
        setFetchError("Failed to load group data. Please try again.");
      }
    };

    fetchData();
  }, [groupId, fetchGroupById, fetchExpensesByGroupId, fetchGroupBalance, retryCount]);

  // Calculate total expenses for the group
  useEffect(() => {
    if (groupExpenses[groupId]) {
      const total = groupExpenses[groupId].reduce((sum, expense) => sum + expense.amount, 0);
      setTotalExpenses(total);
    } else {
      setTotalExpenses(0);
    }
  }, [groupExpenses, groupId]);

  const isLoading = isGroupLoading || isExpensesLoading || isBalancesLoading || isRetrying;
  const error = groupError || expensesError || balancesError || fetchError;

  // Handle retry
  const handleRetry = () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    setTimeout(() => setIsRetrying(false), 500); // Small delay to show loading state
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 size={40} className="animate-spin text-[#1cc29f] mb-4" />
        <p className="text-gray-500">Loading group details...</p>
      </div>
    );
  }

  if (error || !selectedGroup) {
    return (
      <div className="card bg-white p-6 text-center rounded-lg shadow-sm">
        <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-gray-600 mb-6">{error || "Group not found or data could not be loaded."}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/groups" className="btn-secondary px-4 py-2 rounded-md">
            Back to Groups
          </Link>
          <button 
            onClick={handleRetry} 
            className="btn-primary px-4 py-2 rounded-md bg-[#1cc29f] text-white hover:bg-[#18b090]"
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2 inline" />
                Retrying...
              </>
            ) : (
              'Retry'
            )}
          </button>
        </div>
      </div>
    );
  }

  // Verify the selected group matches the current ID
  if (selectedGroup.id !== groupId) {
    return (
      <div className="card bg-white p-6 text-center rounded-lg shadow-sm">
        <AlertCircle size={40} className="mx-auto text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Group Mismatch</h2>
        <p className="text-gray-600 mb-6">The loaded group doesn't match the requested group ID.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/groups" className="btn-secondary px-4 py-2 rounded-md">
            Back to Groups
          </Link>
          <button 
            onClick={handleRetry} 
            className="btn-primary px-4 py-2 rounded-md bg-[#1cc29f] text-white hover:bg-[#18b090]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get the actual expenses and balances for this group from the store
  const currentGroupExpenses = groupExpenses[groupId] || [];
  const currentGroupBalances = groupBalances[groupId]?.balances || [];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link 
          href="/groups" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to groups
        </Link>
      </div>

      {/* Group Details Component */}
      <GroupDetails 
        group={selectedGroup} 
        balances={currentGroupBalances} 
        totalExpenses={totalExpenses} 
      />

      {/* Expenses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Expenses</h2>
          <Link 
            href={`/groups/${groupId}/add-expense`}
            className="btn-primary inline-flex items-center px-4 py-2 rounded-md bg-[#1cc29f] text-white hover:bg-[#18b090]"
          >
            <CreditCard size={18} className="mr-2" />
            Add expense
          </Link>
        </div>

        {/* Expense List Component */}
        <ExpenseList 
          expenses={currentGroupExpenses} 
          groupId={groupId}
          emptyMessage="No expenses have been added to this group yet. Add your first expense to get started!"
        />
      </div>
    </div>
  );
}
