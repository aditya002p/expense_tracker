/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  User,
  DollarSign,
  SplitSquareVertical,
  Loader2,
  Check,
  AlertCircle
} from "lucide-react";
import { User as UserType, SplitType } from "@/lib/types";
import { expensesApi } from "@/lib/api";
import { cn, formatCurrency, calculateEqualSplit } from "@/lib/utils";

interface AddExpenseFormProps {
  groupId: number;
  members: UserType[];
  onSuccess?: () => void;
  className?: string;
}

const AddExpenseForm = ({
  groupId,
  members,
  onSuccess,
  className = ""
}: AddExpenseFormProps) => {
  const router = useRouter();
  
  // Form state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState<number | null>(null);
  const [splitType, setSplitType] = useState<SplitType>(SplitType.EQUAL);
  const [splits, setSplits] = useState<{ userId: number; value: string }[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Initialize splits when members or split type changes
  useEffect(() => {
    if (members.length > 0) {
      if (splitType === SplitType.EQUAL) {
        // For equal splits, initialize with empty strings (will be calculated on submit)
        setSplits(members.map(member => ({
          userId: member.id,
          value: ""
        })));
      } else {
        // For percentage splits, initialize with equal percentages
        const equalPercentage = (100 / members.length).toFixed(2);
        setSplits(members.map(member => ({
          userId: member.id,
          value: equalPercentage
        })));
      }
    }
  }, [members, splitType]);

  // Recalculate equal splits when amount changes
  useEffect(() => {
    if (splitType === SplitType.EQUAL && amount && !isNaN(parseFloat(amount))) {
      const amountValue = parseFloat(amount);
      const equalShare = calculateEqualSplit(amountValue, members.length);
      
      setSplits(members.map(member => ({
        userId: member.id,
        value: equalShare.toString()
      })));
    }
  }, [amount, members, splitType]);

  // Handle split value change
  const handleSplitChange = (userId: number, value: string) => {
    setSplits(splits.map(split => 
      split.userId === userId ? { ...split, value } : split
    ));
  };

  // Validate form before submission
  const validateForm = () => {
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }
    
    if (paidBy === null) {
      setError("Please select who paid for this expense");
      return false;
    }
    
    if (splitType === SplitType.PERCENTAGE) {
      // Validate that percentages sum to 100
      const totalPercentage = splits.reduce((sum, split) => {
        return sum + (parseFloat(split.value) || 0);
      }, 0);
      
      if (Math.abs(totalPercentage - 100) > 0.01) {
        setError(`Percentages must sum to 100%. Current total: ${totalPercentage.toFixed(2)}%`);
        return false;
      }
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError("");
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const amountValue = parseFloat(amount);
      
      // Prepare splits data based on split type
      const splitsData = splits.map(split => {
        if (splitType === SplitType.EQUAL) {
          return {
            user_id: split.userId,
            amount: parseFloat(split.value) || calculateEqualSplit(amountValue, members.length)
          };
        } else {
          const percentage = parseFloat(split.value) || 0;
          return {
            user_id: split.userId,
            percentage,
            amount: (percentage / 100) * amountValue
          };
        }
      });
      
      // In a real app, this would be an API call
      // await expensesApi.create({
      //   group_id: groupId,
      //   description,
      //   amount: amountValue,
      //   paid_by: paidBy,
      //   split_type: splitType,
      //   splits: splitsData
      // });
      
      // Mock success for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      
      // Call success callback or redirect
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setTimeout(() => {
          router.push(`/groups/${groupId}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to add expense:", error);
      setError("Failed to add expense. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`card bg-white ${className}`}>
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-full bg-[#e4f9f5] flex items-center justify-center text-[#1cc29f] mr-3">
          <CreditCard size={20} />
        </div>
        <h2 className="text-xl font-semibold">Add a New Expense</h2>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center">
          <Check size={20} className="text-green-500 mr-2" />
          <p className="text-green-700">Expense added successfully! Redirecting...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description Input */}
          <div>
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Dinner, Movie tickets, Groceries"
              className="form-input"
              disabled={isLoading}
            />
          </div>

          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="form-label">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign size={16} className="text-gray-400" />
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="form-input pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Paid By Dropdown */}
          <div>
            <label htmlFor="paidBy" className="form-label">
              Paid by
            </label>
            <div className="relative">
              <select
                id="paidBy"
                value={paidBy || ""}
                onChange={(e) => setPaidBy(Number(e.target.value))}
                className="form-input appearance-none"
                disabled={isLoading}
              >
                <option value="" disabled>Select who paid</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.id === 1 ? "You" : member.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <User size={16} className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Split Type Radio Buttons */}
          <div>
            <label className="form-label mb-2">
              Split type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="splitType"
                  checked={splitType === SplitType.EQUAL}
                  onChange={() => setSplitType(SplitType.EQUAL)}
                  className="mr-2 h-4 w-4 text-[#1cc29f] focus:ring-[#1cc29f]"
                  disabled={isLoading}
                />
                <span>Equal</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="splitType"
                  checked={splitType === SplitType.PERCENTAGE}
                  onChange={() => setSplitType(SplitType.PERCENTAGE)}
                  className="mr-2 h-4 w-4 text-[#1cc29f] focus:ring-[#1cc29f]"
                  disabled={isLoading}
                />
                <span>Percentage</span>
              </label>
            </div>
          </div>

          {/* Splits Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label mb-0">
                {splitType === SplitType.EQUAL ? "Split equally between" : "Split by percentage"}
              </label>
              {splitType === SplitType.PERCENTAGE && (
                <span className="text-sm text-gray-500">
                  Total: {splits.reduce((sum, split) => sum + (parseFloat(split.value) || 0), 0).toFixed(2)}%
                </span>
              )}
            </div>
            
            <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
              {members.map((member, index) => {
                const split = splits.find(s => s.userId === member.id);
                
                return (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 mr-2">
                        {member.id === 1 ? "Y" : member.name.charAt(0)}
                      </div>
                      <span>{member.id === 1 ? "You" : member.name}</span>
                    </div>
                    
                    <div className="w-24 relative">
                      {splitType === SplitType.EQUAL ? (
                        <div className="text-right font-medium">
                          {amount && !isNaN(parseFloat(amount))
                            ? formatCurrency(parseFloat(split?.value || "0"))
                            : "—"}
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="number"
                            value={split?.value || ""}
                            onChange={(e) => handleSplitChange(member.id, e.target.value)}
                            min="0"
                            max="100"
                            step="0.01"
                            className="form-input text-right pr-8 py-1 text-sm"
                            disabled={isLoading}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <span className="text-gray-500 text-sm">%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
              <AlertCircle size={18} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className={cn(
                "btn-primary flex items-center justify-center min-w-[120px]",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Expense"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddExpenseForm;
