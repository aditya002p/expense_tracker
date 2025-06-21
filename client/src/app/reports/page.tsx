"use client";

import { useState, useEffect } from "react";
import { useGroupsStore, useUserStore } from "@/store";
import { 
  BarChart3, 
  Calendar, 
  Filter, 
  Loader2, 
  RefreshCw 
} from "lucide-react";
import ExpenseAnalytics from "@/components/reports/ExpenseAnalytics";
import ExpenseChart from "@/components/reports/ExpenseChart";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  // Get data from stores
  const { groups, isLoading: isGroupsLoading, error: groupsError, fetchGroups } =
    useGroupsStore();
  const { currentUser } = useUserStore();
  
  // Local state
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Load groups once on mount
  useEffect(() => {
    // Avoid re-fetch loops by providing an empty dependency list
    fetchGroups().catch(() => {
      /* error handled via store */
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle group selection change
  const handleGroupChange = (value: string) => {
    setSelectedGroupId(value === "all" ? null : Number(value));
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate refreshing data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-500">
            Analyze your expenses and get insights into your spending habits
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Group Selector */}
          <Select 
            value={selectedGroupId ? selectedGroupId.toString() : "all"}
            onValueChange={handleGroupChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Refresh Button */}
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {/* ===== Error state for groups loading ===== */}
      {groupsError && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-red-600 font-medium mb-2">
            Failed to load groups: {groupsError}
          </p>
          <Button
            variant="outline"
            onClick={() => fetchGroups()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {!groupsError && (
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart3 size={16} className="mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends & Forecasts</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Main Analytics Component */}
          <ExpenseAnalytics 
            groupId={selectedGroupId || undefined}
            className="mb-6"
          />
        </TabsContent>
        
        {/* Detailed Analysis Tab */}
        <TabsContent value="detailed" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Category Analysis</CardTitle>
                <CardDescription>
                  Breakdown of expenses by category
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ExpenseChart
                  chartType="pie"
                  dataDimension="category"
                  groupId={selectedGroupId || undefined}
                  height={300}
                  showControls={true}
                />
              </CardContent>
            </Card>
            
            {/* User Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>User Analysis</CardTitle>
                <CardDescription>
                  Breakdown of expenses by user
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ExpenseChart
                  chartType="bar"
                  dataDimension="user"
                  groupId={selectedGroupId || undefined}
                  height={300}
                  showControls={true}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>
                How your expenses change over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ExpenseChart
                chartType="line"
                dataDimension="month"
                groupId={selectedGroupId || undefined}
                height={300}
                showControls={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Trends & Forecasts Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spending Forecast</CardTitle>
              <CardDescription>
                Projected expenses based on your spending history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">
                    Forecasting feature coming soon
                  </p>
                  <p className="text-sm text-gray-400">
                    We're working on predictive analytics to help you plan your future expenses.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Historical Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Historical Comparison</CardTitle>
              <CardDescription>
                Compare your current spending with previous periods
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ExpenseChart
                chartType="area"
                dataDimension="month"
                groupId={selectedGroupId || undefined}
                height={300}
                showControls={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}
      
      {/* Loading State */}
      {(isGroupsLoading || isRefreshing) && (
        <div className="fixed inset-0 bg-black/5 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
            <Loader2 size={24} className="animate-spin text-[#1cc29f] mr-2" />
            <p>Loading report data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
