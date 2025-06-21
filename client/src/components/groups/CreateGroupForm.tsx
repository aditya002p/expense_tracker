/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, X, Check, Search, Loader2 } from "lucide-react";
import { User } from "@/lib/types";
import { usersApi, groupsApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CreateGroupFormProps {
  className?: string;
}

const CreateGroupForm = ({ className = "" }: CreateGroupFormProps) => {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch available users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        // In a real app, this would be an API call
        // const users = await usersApi.getAll();
        
        // Mock data for demonstration
        const mockUsers: User[] = [
          { id: 1, name: "John Doe", email: "john@example.com" },
          { id: 2, name: "Jane Smith", email: "jane@example.com" },
          { id: 3, name: "Alex Johnson", email: "alex@example.com" },
          { id: 4, name: "Sarah Miller", email: "sarah@example.com" },
          { id: 5, name: "Michael Brown", email: "michael@example.com" },
          { id: 6, name: "Emily Davis", email: "emily@example.com" },
        ];
        
        setAvailableUsers(mockUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setError("Failed to load users. Please try again.");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = availableUsers.filter(user => 
    !selectedUsers.some(selectedUser => selectedUser.id === user.id) &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle user selection
  const toggleUserSelection = (user: User) => {
    if (selectedUsers.some(selectedUser => selectedUser.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(selectedUser => selectedUser.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }
    
    if (selectedUsers.length === 0) {
      setError("Please select at least one user");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // const newGroup = await groupsApi.create({
      //   name: groupName,
      //   member_ids: selectedUsers.map(user => user.id)
      // });
      
      // Mock success for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      
      // Redirect to the new group page after a short delay
      setTimeout(() => {
        router.push("/groups");
      }, 1500);
    } catch (error) {
      console.error("Failed to create group:", error);
      setError("Failed to create group. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`card bg-white ${className}`}>
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-full bg-[#e4f9f5] flex items-center justify-center text-[#1cc29f] mr-3">
          <Users size={20} />
        </div>
        <h2 className="text-xl font-semibold">Create a New Group</h2>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center">
          <Check size={20} className="text-green-500 mr-2" />
          <p className="text-green-700">Group created successfully! Redirecting...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name Input */}
          <div>
            <label htmlFor="groupName" className="form-label">
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Roommates, Goa Trip, Office Lunch"
              className="form-input"
              disabled={isLoading}
            />
          </div>

          {/* User Selection */}
          <div>
            <label className="form-label">
              Add Group Members
            </label>
            
            {/* Selected Users */}
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedUsers.map(user => (
                <div 
                  key={user.id}
                  className="bg-[#e4f9f5] text-[#1cc29f] px-3 py-1 rounded-full flex items-center text-sm"
                >
                  <span>{user.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleUserSelection(user)}
                    className="ml-2 text-[#1cc29f] hover:text-[#18b090] focus:outline-none"
                    disabled={isLoading}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* User Search & Dropdown */}
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users by name or email"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!isDropdownOpen) setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="form-input pl-10"
                  disabled={isLoading}
                />
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {isDropdownOpen && (
                <div 
                  className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
                  onBlur={() => setIsDropdownOpen(false)}
                >
                  {isLoadingUsers ? (
                    <div className="p-4 text-center text-gray-500">
                      <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                      <p>Loading users...</p>
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    <ul>
                      {filteredUsers.map(user => (
                        <li key={user.id}>
                          <button
                            type="button"
                            onClick={() => {
                              toggleUserSelection(user);
                              setSearchQuery("");
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                            <Check size={18} className="text-[#1cc29f] opacity-0" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <p>No users found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
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
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateGroupForm;
