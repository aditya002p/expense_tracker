"use client"
import Link from "next/link";
import { useState } from "react";
import { 
  Users, 
  Plus, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  MoreHorizontal,
  Settings,
  Trash2,
  Share2,
  UserPlus
} from "lucide-react";
import { Group, User, Balance } from "@/lib/types";
import { formatCurrency, formatDate, getInitials, stringToColor } from "@/lib/utils";

interface GroupDetailsProps {
  group: Group;
  balances?: Balance[];
  totalExpenses?: number;
  className?: string;
}

const GroupDetails = ({ group, balances = [], totalExpenses = 0, className = "" }: GroupDetailsProps) => {
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Toggle more actions dropdown
  const toggleMoreActions = () => {
    setShowMoreActions(!showMoreActions);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Group Header Card */}
      <div className="card bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full bg-[#e4f9f5] flex items-center justify-center text-[#1cc29f] mr-4">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{group.name}</h1>
              <p className="text-gray-500 text-sm">
                Created {formatDate(group.created_at, 'long')}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link 
              href={`/groups/${group.id}/add-expense`}
              className="btn-primary inline-flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Add expense
            </Link>
            
            <div className="relative">
              <button 
                onClick={toggleMoreActions}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                aria-label="More actions"
              >
                <MoreHorizontal size={20} />
              </button>
              
              {showMoreActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100">
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      // Handle add member action
                      setShowMoreActions(false);
                    }}
                  >
                    <UserPlus size={16} className="mr-2" />
                    Add members
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      // Handle share action
                      setShowMoreActions(false);
                    }}
                  >
                    <Share2 size={16} className="mr-2" />
                    Share group
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      // Handle settings action
                      setShowMoreActions(false);
                    }}
                  >
                    <Settings size={16} className="mr-2" />
                    Group settings
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      // Handle delete action
                      setShowMoreActions(false);
                    }}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete group
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Expenses */}
        <div className="card bg-white">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Total expenses</h3>
          <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {group.members.length} members
          </p>
        </div>

        {/* Your Balance */}
        <div className="card bg-white">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Your balance</h3>
          <div className="flex items-center">
            <TrendingUp size={20} className="text-green-500 mr-2" />
            <p className="text-2xl font-bold text-green-500">{formatCurrency(250.50)}</p>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            You are owed money in this group
          </p>
        </div>

        {/* Group Activity */}
        <div className="card bg-white">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Latest activity</h3>
          <p className="text-gray-600">
            Last expense added {formatDate("2025-06-18T14:30:00Z", 'relative')}
          </p>
          <Link 
            href={`/groups/${group.id}/activity`}
            className="text-[#1cc29f] text-sm font-medium mt-2 inline-block hover:underline"
          >
            View all activity
          </Link>
        </div>
      </div>

      {/* Group Members */}
      <div className="card bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Members ({group.members.length})</h2>
          <button className="text-[#1cc29f] text-sm font-medium flex items-center hover:underline">
            <UserPlus size={16} className="mr-1" />
            Add members
          </button>
        </div>

        <div className="space-y-3">
          {group.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white mr-3 ${stringToColor(member.name)}`}>
                  {getInitials(member.name)}
                </div>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              
              {/* Show balance if this member has one */}
              {balances.some(b => 
                (b.from_user_id === member.id || b.to_user_id === member.id)
              ) && (
                <div className="text-right">
                  {balances
                    .filter(b => b.from_user_id === member.id)
                    .map(b => (
                      <p key={`${b.from_user_id}-${b.to_user_id}`} className="text-red-500">
                        Owes {formatCurrency(b.amount)}
                      </p>
                    ))}
                  
                  {balances
                    .filter(b => b.to_user_id === member.id)
                    .map(b => (
                      <p key={`${b.from_user_id}-${b.to_user_id}`} className="text-green-500">
                        Is owed {formatCurrency(b.amount)}
                      </p>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Group Balances */}
      {balances.length > 0 && (
        <div className="card bg-white">
          <h2 className="text-xl font-semibold mb-4">Group Balances</h2>
          
          <div className="space-y-3">
            {balances.map((balance, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <span className="font-medium">{balance.from_user_name}</span>
                    <span className="mx-2 text-gray-500">owes</span>
                    <span className="font-medium">{balance.to_user_name}</span>
                  </div>
                </div>
                <div className="font-semibold">
                  {formatCurrency(balance.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
