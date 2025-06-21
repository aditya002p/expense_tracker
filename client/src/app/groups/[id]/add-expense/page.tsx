/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Group } from "@/lib/types";
import { groupsApi } from "@/lib/api";
import AddExpenseForm from "@/components/expenses/AddExpenseForm";

export default function AddExpensePage() {
  const params = useParams();
  const router = useRouter();
  const groupId = Number(params.id);
  
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch group data to get members
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real app, this would be an API call
        // const groupResponse = await groupsApi.getById(groupId);
        
        // Mock data for demonstration
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
        
        // Simulate fetching the specific group based on ID
        if (groupId === 2) {
          setGroup({
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
          });
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

  // Handle successful expense creation
  const handleSuccess = () => {
    router.push(`/groups/${groupId}`);
  };

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
          href={`/groups/${groupId}`} 
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to {group.name}
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex items-center">
        <h1 className="text-3xl font-bold">Add Expense to {group.name}</h1>
      </div>

      {/* Description */}
      <p className="text-gray-600 max-w-2xl">
        Add a new expense to this group. You can split it equally among all members or specify custom percentages.
      </p>

      {/* Add Expense Form */}
      <div className="max-w-2xl">
        <AddExpenseForm 
          groupId={groupId} 
          members={group.members} 
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
