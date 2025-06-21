/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { Group, Expense, Balance, SplitType } from "@/lib/types";
import { groupsApi, expensesApi, balancesApi } from "@/lib/api";
import GroupDetails from "@/components/groups/GroupDetails";
import ExpenseList from "@/components/expenses/ExpenseList";

// Mock data for demonstration
const mockGroup: Group = {
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
};

const mockExpenses: Expense[] = [
  {
    id: 1,
    group_id: 2,
    description: "Hotel Booking",
    amount: 8000,
    paid_by: 1, // User ID of who paid
    split_type: SplitType.EQUAL,
    splits: [
      { user_id: 1, amount: 1600 },
      { user_id: 2, amount: 1600 },
      { user_id: 4, amount: 1600 },
      { user_id: 5, amount: 1600 },
      { user_id: 6, amount: 1600 }
    ],
    created_at: "2025-03-23T10:30:00Z",
    created_by: 1
  },
  {
    id: 2,
    group_id: 2,
    description: "Dinner at Beach Shack",
    amount: 2400,
    paid_by: 4, // User ID of who paid
    split_type: SplitType.EQUAL,
    splits: [
      { user_id: 1, amount: 480 },
      { user_id: 2, amount: 480 },
      { user_id: 4, amount: 480 },
      { user_id: 5, amount: 480 },
      { user_id: 6, amount: 480 }
    ],
    created_at: "2025-03-24T20:15:00Z",
    created_by: 4
  },
  {
    id: 3,
    group_id: 2,
    description: "Taxi Rides",
    amount: 1200,
    paid_by: 2, // User ID of who paid
    split_type: SplitType.PERCENTAGE,
    splits: [
      { user_id: 1, percentage: 20, amount: 240 },
      { user_id: 2, percentage: 20, amount: 240 },
      { user_id: 4, percentage: 20, amount: 240 },
      { user_id: 5, percentage: 20, amount: 240 },
      { user_id: 6, percentage: 20, amount: 240 }
    ],
    created_at: "2025-03-25T14:45:00Z",
    created_by: 2
  },
  {
    id: 4,
    group_id: 2,
    description: "Water Sports",
    amount: 4150.75,
    paid_by: 5, // User ID of who paid
    split_type: SplitType.EQUAL,
    splits: [
      { user_id: 1, amount: 830.15 },
      { user_id: 2, amount: 830.15 },
      { user_id: 4, amount: 830.15 },
      { user_id: 5, amount: 830.15 },
      { user_id: 6, amount: 830.15 }
    ],
    created_at: "2025-03-26T16:20:00Z",
    created_by: 5
  }
];

const mockBalances: Balance[] = [
  {
    from_user_id: 1,
    from_user_name: "John Doe",
    to_user_id: 4,
    to_user_name: "Sarah Miller",
    amount: 480
  },
  {
    from_user_id: 2,
    from_user_name: "Jane Smith",
    to_user_id: 1,
    to_user_name: "John Doe",
    amount: 1360
  },
  {
    from_user_id: 6,
    from_user_name: "Emily Davis",
    to_user_id: 5,
    to_user_name: "Michael Brown",
    amount: 590.15
  }
];

export default function GroupDetailsPage() {
  const params = useParams();
  const groupId = Number(params.id);
  
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch group data
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real app, these would be actual API calls
        // const groupResponse = await groupsApi.getById(groupId);
        // const expensesResponse = await expensesApi.getByGroupId(groupId);
        // const balancesResponse = await balancesApi.getByGroupId(groupId);
        
        // Using mock data for demonstration
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        // Simulate fetching the specific group based on ID
        if (groupId === 2) {
          setGroup(mockGroup);
          setExpenses(mockExpenses);
          setBalances(mockBalances);
        } else {
          // For other IDs, create a generic group
          setGroup({
            id: groupId,
            name: `Group ${groupId}`,
            members: [
              { id: 1, name: "John Doe", email: "john@example.com" },
              { id: 2, name: "Jane Smith", email: "jane@example.com" },
            ],
            created_at: "2025-01-15T10:30:00Z",
            total_expenses: 0
          });
          setExpenses([]);
          setBalances([]);
        }
      } catch (error) {
        console.error("Failed to fetch group data:", error);
        setError("Failed to load group details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 size={40} className="animate-spin text-[#1cc29f] mb-4" />
        <p className="text-gray-500">Loading group details...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="card bg-white p-6 text-center">
        <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-gray-600 mb-6">{error || "Group not found"}</p>
        <Link href="/groups" className="btn-primary">
          Back to Groups
        </Link>
      </div>
    );
  }

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
        group={group} 
        balances={balances} 
        totalExpenses={group.total_expenses || 0} 
      />

      {/* Expenses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Expenses</h2>
          <Link 
            href={`/groups/${groupId}/add-expense`}
            className="btn-primary inline-flex items-center"
          >
            <CreditCard size={18} className="mr-2" />
            Add expense
          </Link>
        </div>

        {/* Expense List Component */}
        <ExpenseList 
          expenses={expenses} 
          groupId={groupId}
          emptyMessage="No expenses have been added to this group yet. Add your first expense to get started!"
        />
      </div>
    </div>
  );
}
