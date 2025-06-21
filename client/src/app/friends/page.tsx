"use client";

import { useState, useEffect } from "react";
import { useUserStore, useBalancesStore } from "@/store";
import { 
  UserPlus, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Mail, 
  X,
  Check,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { formatCurrency, getInitials, stringToColor } from "@/lib/utils";
import { User } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock friends data for demonstration
const mockFriends: (User & { balance?: number })[] = [
  { id: 2, name: "Jane Smith", email: "jane@example.com", balance: 250.50 },
  { id: 3, name: "Alex Johnson", email: "alex@example.com", balance: -120.75 },
  { id: 4, name: "Sarah Miller", email: "sarah@example.com", balance: 0 },
  { id: 5, name: "Michael Brown", email: "michael@example.com", balance: 500.25 },
  { id: 6, name: "Emily Davis", email: "emily@example.com", balance: -350.00 },
  { id: 7, name: "David Wilson", email: "david@example.com", balance: 75.50 },
  { id: 8, name: "Lisa Taylor", email: "lisa@example.com", balance: -25.00 },
];

export default function FriendsPage() {
  // Get data from stores
  const { currentUser } = useUserStore();
  const { userBalance, isLoading: isBalanceLoading } = useBalancesStore();
  
  // Local state
  const [friends, setFriends] = useState<(User & { balance?: number })[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "owed" | "owing" | "settled">("all");
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  
  // New friend form state
  const [newFriendEmail, setNewFriendEmail] = useState("");
  const [newFriendName, setNewFriendName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  
  // Fetch friends data on component mount
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        // const response = await fetch('/api/friends');
        // const data = await response.json();
        
        // Using mock data for demonstration
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        setFriends(mockFriends);
      } catch (error) {
        console.error("Failed to fetch friends:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFriends();
  }, []);
  
  // Filter and search friends
  const filteredFriends = friends.filter(friend => {
    // Apply search filter
    const matchesSearch = 
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Apply balance filter
    switch (filterType) {
      case "owed":
        return (friend.balance || 0) > 0;
      case "owing":
        return (friend.balance || 0) < 0;
      case "settled":
        return (friend.balance || 0) === 0;
      default:
        return true;
    }
  });
  
  // Toggle filter panel
  const toggleFilterPanel = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };
  
  // Handle filter change
  const handleFilterChange = (type: "all" | "owed" | "owing" | "settled") => {
    setFilterType(type);
  };
  
  // Handle add friend form submission
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset form state
    setFormError("");
    setFormSuccess(false);
    
    // Validate form
    if (!newFriendEmail.trim()) {
      setFormError("Email is required");
      return;
    }
    
    if (!newFriendEmail.includes("@")) {
      setFormError("Please enter a valid email address");
      return;
    }
    
    if (!newFriendName.trim()) {
      setFormError("Name is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call
      // await fetch('/api/friends', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name: newFriendName, email: newFriendEmail })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the new friend to the list
      const newFriend: User & { balance?: number } = {
        id: Math.max(...friends.map(f => f.id)) + 1,
        name: newFriendName,
        email: newFriendEmail,
        balance: 0
      };
      
      setFriends([...friends, newFriend]);
      setFormSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setNewFriendName("");
        setNewFriendEmail("");
        setIsAddFriendOpen(false);
        setFormSuccess(false);
      }, 1500);
      
    } catch (error) {
      console.error("Failed to add friend:", error);
      setFormError("Failed to add friend. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Friends</h1>
          <p className="text-gray-500">
            Manage your friends and view balances
          </p>
        </div>
        
        <Dialog open={isAddFriendOpen} onOpenChange={setIsAddFriendOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1cc29f] hover:bg-[#18b090] text-white">
              <UserPlus size={18} className="mr-2" />
              Add Friend
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a Friend</DialogTitle>
              <DialogDescription>
                Add a friend to split expenses with them.
              </DialogDescription>
            </DialogHeader>
            
            {formSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center">
                <Check size={20} className="text-green-500 mr-2" />
                <p className="text-green-700">Friend added successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleAddFriend} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="friend@example.com"
                      className="pl-10"
                      value={newFriendEmail}
                      onChange={(e) => setNewFriendEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    placeholder="Friend's name"
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                    <AlertCircle size={16} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{formError}</p>
                  </div>
                )}
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddFriendOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#1cc29f] hover:bg-[#18b090] text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Friend"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            {/* Search Input */}
            <div className="relative flex-grow">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search friends by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={toggleFilterPanel}
              className="flex items-center"
            >
              <Filter size={18} className="mr-2" />
              Filters
              {isFilterExpanded ? (
                <ChevronUp size={16} className="ml-2" />
              ) : (
                <ChevronDown size={16} className="ml-2" />
              )}
            </Button>
          </div>
          
          {/* Expanded Filter Panel */}
          {isFilterExpanded && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("all")}
                  className={filterType === "all" ? "bg-[#1cc29f] hover:bg-[#18b090]" : ""}
                >
                  All Friends
                </Button>
                <Button
                  variant={filterType === "owed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("owed")}
                  className={filterType === "owed" ? "bg-[#1cc29f] hover:bg-[#18b090]" : ""}
                >
                  Owe You
                </Button>
                <Button
                  variant={filterType === "owing" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("owing")}
                  className={filterType === "owing" ? "bg-[#1cc29f] hover:bg-[#18b090]" : ""}
                >
                  You Owe
                </Button>
                <Button
                  variant={filterType === "settled" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("settled")}
                  className={filterType === "settled" ? "bg-[#1cc29f] hover:bg-[#18b090]" : ""}
                >
                  Settled Up
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Friends List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={40} className="animate-spin text-[#1cc29f] mb-4" />
          <p className="text-gray-500">Loading friends...</p>
        </div>
      ) : filteredFriends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFriends.map((friend) => (
            <Card key={friend.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white mr-3",
                        stringToColor(friend.name)
                      )}
                    >
                      {getInitials(friend.name)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{friend.name}</CardTitle>
                      <CardDescription>{friend.email}</CardDescription>
                    </div>
                  </div>
                  
                  {friend.balance !== undefined && friend.balance !== 0 && (
                    <Badge 
                      className={cn(
                        "px-2 py-1",
                        friend.balance > 0 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      )}
                    >
                      {friend.balance > 0 ? "Owes you" : "You owe"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {friend.balance !== undefined && (
                  <div className="flex items-center">
                    {friend.balance > 0 ? (
                      <>
                        <TrendingUp size={16} className="text-green-500 mr-2" />
                        <span className="text-green-500 font-medium">
                          {friend.name} owes you {formatCurrency(friend.balance)}
                        </span>
                      </>
                    ) : friend.balance < 0 ? (
                      <>
                        <TrendingDown size={16} className="text-red-500 mr-2" />
                        <span className="text-red-500 font-medium">
                          You owe {friend.name} {formatCurrency(Math.abs(friend.balance))}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500">All settled up</span>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button 
                  size="sm"
                  className="bg-[#1cc29f] hover:bg-[#18b090] text-white"
                >
                  Settle Up
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <UserPlus size={24} className="text-gray-400" />
          </div>
          <CardTitle className="mb-2">No friends found</CardTitle>
          <CardDescription className="mb-6">
            {searchQuery || filterType !== "all"
              ? "Try changing your search or filters to see more results."
              : "You haven't added any friends yet."}
          </CardDescription>
          <Button 
            onClick={() => setIsAddFriendOpen(true)}
            className="bg-[#1cc29f] hover:bg-[#18b090] text-white"
          >
            <UserPlus size={18} className="mr-2" />
            Add Your First Friend
          </Button>
        </Card>
      )}
    </div>
  );
}
