"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  PlusCircle, 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  DollarSign
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Mock data for demonstration
const mockUserBalance = {
  total_owed: 1250.75,
  total_owes: 850.25,
  net_balance: 400.50
};

const mockGroups = [
  { id: 1, name: "Roommates", members: 4, total_expenses: 2450.50 },
  { id: 2, name: "Goa Trip", members: 6, total_expenses: 15750.75 },
  { id: 3, name: "Office Lunch", members: 8, total_expenses: 3200.00 },
  { id: 4, name: "Weekend Getaway", members: 3, total_expenses: 8500.25 }
];

const mockRecentActivity = [
  { 
    id: 1, 
    description: "Dinner at Taj", 
    amount: 2400, 
    group_name: "Goa Trip", 
    group_id: 2, 
    created_at: "2025-06-19T18:30:00Z", 
    paid_by_name: "John Doe" 
  },
  { 
    id: 2, 
    description: "Electricity Bill", 
    amount: 1200, 
    group_name: "Roommates", 
    group_id: 1, 
    created_at: "2025-06-18T10:15:00Z", 
    paid_by_name: "You" 
  },
  { 
    id: 3, 
    description: "Movie Tickets", 
    amount: 750, 
    group_name: "Weekend Getaway", 
    group_id: 4, 
    created_at: "2025-06-17T20:45:00Z", 
    paid_by_name: "Sarah Miller" 
  },
  { 
    id: 4, 
    description: "Groceries", 
    amount: 1850, 
    group_name: "Roommates", 
    group_id: 1, 
    created_at: "2025-06-16T16:20:00Z", 
    paid_by_name: "Alex Johnson" 
  }
];

export default function Dashboard() {
  const [balance, setBalance] = useState(mockUserBalance);
  const [groups, setGroups] = useState(mockGroups);
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API call to fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, these would be actual API calls
        // const balanceResponse = await fetch('/api/user/balance');
        // const balance = await balanceResponse.json();
        // setBalance(balance);
        
        // const groupsResponse = await fetch('/api/user/groups');
        // const groups = await groupsResponse.json();
        // setGroups(groups);
        
        // const activityResponse = await fetch('/api/user/activity');
        // const activity = await activityResponse.json();
        // setRecentActivity(activity);
        
        // Using mock data for now
        setBalance(mockUserBalance);
        setGroups(mockGroups);
        setRecentActivity(mockRecentActivity);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1cc29f]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link 
          href="/groups/create" 
          className="btn-primary inline-flex items-center justify-center"
        >
          <PlusCircle size={18} className="mr-2" />
          Create a new group
        </Link>
      </div>

      {/* Balance Summary */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Owed (others owe you) */}
          <div className="card bg-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-700">Total owed to you</h3>
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-500">
              {formatCurrency(balance.total_owed)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Money to collect from others
            </p>
          </div>

          {/* Total Owes (you owe others) */}
          <div className="card bg-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-700">Total you owe</h3>
              <TrendingDown size={20} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-500">
              {formatCurrency(balance.total_owes)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Money you need to pay back
            </p>
          </div>

          {/* Net Balance */}
          <div className="card bg-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-700">Net balance</h3>
              <DollarSign size={20} className={balance.net_balance >= 0 ? "text-green-500" : "text-red-500"} />
            </div>
            <p className={`text-2xl font-bold ${balance.net_balance >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatCurrency(balance.net_balance)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {balance.net_balance >= 0 ? "Overall, you are owed money" : "Overall, you owe money"}
            </p>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Link href="/activity" className="text-[#1cc29f] hover:text-[#18b090] flex items-center text-sm font-medium">
            View all <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="card bg-white divide-y divide-gray-100">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#e4f9f5] flex items-center justify-center text-[#1cc29f]">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-gray-500">
                        {activity.paid_by_name} paid {formatCurrency(activity.amount)} in{" "}
                        <Link href={`/groups/${activity.group_id}`} className="text-[#1cc29f] hover:underline">
                          {activity.group_name}
                        </Link>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.created_at).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{formatCurrency(activity.amount)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </section>

      {/* Your Groups */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Groups</h2>
          <Link href="/groups" className="text-[#1cc29f] hover:text-[#18b090] flex items-center text-sm font-medium">
            View all <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Link href={`/groups/${group.id}`} key={group.id} className="card bg-white hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-[#e4f9f5] flex items-center justify-center text-[#1cc29f]">
                  <Users size={20} />
                </div>
                <span className="badge badge-blue">
                  {group.members} members
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-1">{group.name}</h3>
              <p className="text-gray-500 text-sm mb-3">
                Total expenses: {formatCurrency(group.total_expenses)}
              </p>
              <div className="mt-auto pt-2">
                <span className="text-[#1cc29f] text-sm font-medium flex items-center">
                  View details <ArrowRight size={14} className="ml-1" />
                </span>
              </div>
            </Link>
          ))}

          {/* Create new group card */}
          <Link href="/groups/create" className="card bg-gray-50 hover:bg-gray-100 border-dashed border-2 border-gray-200 flex flex-col items-center justify-center text-center p-6 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1cc29f] mb-3">
              <PlusCircle size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-1">Create a new group</h3>
            <p className="text-gray-500 text-sm">
              Start tracking expenses with friends, roommates, or for a trip
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
