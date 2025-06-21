"use client"
import { useState } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  User, 
  SplitSquareVertical,
  Loader2
} from "lucide-react";
import { Expense, SplitType } from "@/lib/types";
import { formatCurrency, formatDate, getInitials, stringToColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ExpenseListProps {
  expenses: Expense[];
  groupId?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

const ExpenseList = ({ 
  expenses, 
  groupId, 
  isLoading = false, 
  emptyMessage = "No expenses found", 
  className = "" 
}: ExpenseListProps) => {
  const [expandedExpenseId, setExpandedExpenseId] = useState<number | null>(null);

  // Toggle expense details expansion
  const toggleExpenseDetails = (expenseId: number) => {
    if (expandedExpenseId === expenseId) {
      setExpandedExpenseId(null);
    } else {
      setExpandedExpenseId(expenseId);
    }
  };

  // Get split type label
  const getSplitTypeLabel = (splitType: SplitType) => {
    return splitType === SplitType.EQUAL ? "Equal Split" : "Percentage Split";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 size={40} className="animate-spin text-[#1cc29f] mb-4" />
        <p className="text-gray-500">Loading expenses...</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="card bg-white text-center py-12">
        <CreditCard size={40} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 mb-6">{emptyMessage}</p>
        {groupId && (
          <Link 
            href={`/groups/${groupId}/add-expense`} 
            className="btn-primary inline-flex items-center"
          >
            Add your first expense
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {expenses.map((expense) => (
        <div 
          key={expense.id} 
          className="card bg-white hover:shadow-md transition-shadow"
        >
          {/* Expense Summary Row */}
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleExpenseDetails(expense.id)}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#e4f9f5] flex items-center justify-center text-[#1cc29f] mr-3">
                <CreditCard size={18} />
              </div>
              <div>
                <h3 className="font-medium">{expense.description}</h3>
                <p className="text-sm text-gray-500">
                  {formatDate(expense.created_at, 'short')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="text-right mr-4">
                <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                <p className="text-xs text-gray-500">{getSplitTypeLabel(expense.split_type)}</p>
              </div>
              {expandedExpenseId === expense.id ? (
                <ChevronUp size={20} className="text-gray-400" />
              ) : (
                <ChevronDown size={20} className="text-gray-400" />
              )}
            </div>
          </div>
          
          {/* Expanded Details */}
          {expandedExpenseId === expense.id && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              {/* Expense Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Paid By */}
                <div className="flex items-center">
                  <User size={16} className="text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Paid by</p>
                    <p className="font-medium">
                      {expense.paid_by === 1 ? "You" : `User ${expense.paid_by}`}
                    </p>
                  </div>
                </div>
                
                {/* Date */}
                <div className="flex items-center">
                  <Calendar size={16} className="text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {formatDate(expense.created_at, 'long')}
                    </p>
                  </div>
                </div>
                
                {/* Split Type */}
                <div className="flex items-center">
                  <SplitSquareVertical size={16} className="text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Split type</p>
                    <p className="font-medium">
                      {getSplitTypeLabel(expense.split_type)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Split Details */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Split Details</h4>
                <div className="space-y-2">
                  {expense.splits.map((split, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm mr-2",
                          stringToColor(`User ${split.user_id}`)
                        )}>
                          {getInitials(`User ${split.user_id}`)}
                        </div>
                        <span>
                          {split.user_id === 1 ? "You" : `User ${split.user_id}`}
                        </span>
                      </div>
                      <div>
                        {expense.split_type === SplitType.EQUAL ? (
                          <span>{formatCurrency(split.amount || 0)}</span>
                        ) : (
                          <span>{split.percentage}% ({formatCurrency(split.amount || 0)})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end mt-4 space-x-2">
                <button className="text-sm text-gray-600 hover:text-gray-800">
                  Edit
                </button>
                <button className="text-sm text-red-600 hover:text-red-800">
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
