"use client";

import { useState, useEffect } from "react";
import { useExpensesStore, useReportStore, useUserStore } from "@/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Users, 
  PieChart, 
  BarChart3, 
  ArrowRight, 
  CreditCard, 
  Loader2,
  AlertCircle
} from "lucide-react";
import ExpenseChart, { ChartType, DataDimension } from "./ExpenseChart";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface ExpenseAnalyticsProps {
  groupId?: number;
  className?: string;
}

const ExpenseAnalytics = ({ groupId, className = "" }: ExpenseAnalyticsProps) => {
  // Get data from stores
  const { expenses, filteredExpenses, isLoading: isExpensesLoading } = useExpensesStore(state => ({
    expenses: groupId ? state.groupExpenses[groupId] || [] : state.expenses,
    filteredExpenses: state.getFilteredExpenses(groupId),
    isLoading: state.isLoading
  }));
  
  const { 
    expensesByCategory, 
    expensesByMonth, 
    expensesByUser,
    dateRange,
    setDateRange,
    generateReports,
    isLoading: isReportLoading 
  } = useReportStore();
  
  const { users, currentUser } = useUserStore();
  
  // Local state
  const [selectedTab, setSelectedTab] = useState("overview");
  const [timeframe, setTimeframe] = useState("all");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [dataDimension, setDataDimension] = useState<DataDimension>("category");
  
  // Generate reports when component mounts or filters change
  useEffect(() => {
    generateReports(groupId);
  }, [generateReports, groupId, filteredExpenses]);
  
  // Handle date range selection
  const handleDateRangeChange = (range: { start: Date | null, end: Date | null }) => {
    setDateRange(range);
  };
  
  // Handle timeframe selection
  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
    
    const now = new Date();
    let start: Date | null = null;
    
    switch (value) {
      case "week":
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case "month":
        start = new Date(now);
        start.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        start = new Date(now);
        start.setMonth(now.getMonth() - 3);
        break;
      case "year":
        start = new Date(now);
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        // "all" - no date filtering
        start = null;
    }
    
    setDateRange({ start, end: value === "all" ? null : now });
  };
  
  // Calculate summary statistics
  const calculateSummaryStats = () => {
    if (filteredExpenses.length === 0) {
      return {
        totalAmount: 0,
        averageAmount: 0,
        maxAmount: 0,
        minAmount: 0,
        expenseCount: 0,
        trend: 0
      };
    }
    
    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expenseCount = filteredExpenses.length;
    const averageAmount = totalAmount / expenseCount;
    const maxAmount = Math.max(...filteredExpenses.map(exp => exp.amount));
    const minAmount = Math.min(...filteredExpenses.map(exp => exp.amount));
    
    // Calculate trend (compare with previous period)
    let trend = 0;
    if (dateRange.start && dateRange.end) {
      const periodLength = dateRange.end.getTime() - dateRange.start.getTime();
      const previousStart = new Date(dateRange.start.getTime() - periodLength);
      const previousEnd = new Date(dateRange.start.getTime() - 1); // 1ms before current period
      
      const previousPeriodExpenses = expenses.filter(exp => {
        const date = new Date(exp.created_at);
        return date >= previousStart && date <= previousEnd;
      });
      
      const previousTotal = previousPeriodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      if (previousTotal > 0) {
        trend = ((totalAmount - previousTotal) / previousTotal) * 100;
      }
    }
    
    return {
      totalAmount,
      averageAmount,
      maxAmount,
      minAmount,
      expenseCount,
      trend
    };
  };
  
  // Get top spending categories
  const getTopCategories = () => {
    return Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));
  };
  
  // Get top spenders
  const getTopSpenders = () => {
    return Object.entries(expensesByUser)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([userId, amount]) => {
        const user = users.find(u => u.id === Number(userId));
        return {
          userId: Number(userId),
          name: user ? (user.id === currentUser?.id ? "You" : user.name) : `User ${userId}`,
          amount
        };
      });
  };
  
  // Get expense trends
  const getExpenseTrends = () => {
    return Object.entries(expensesByMonth)
      .sort() // Sort chronologically
      .slice(-6) // Last 6 months
      .map(([month, amount]) => {
        const [year, monthNum] = month.split('-');
        const date = new Date(Number(year), Number(monthNum) - 1);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          amount
        };
      });
  };
  
  // Calculate insights
  const getInsights = () => {
    if (filteredExpenses.length === 0) return [];
    
    const insights: { type: string; message: string }[] = [];
    const stats = calculateSummaryStats();
    
    // Trend insight
    if (stats.trend !== 0) {
      insights.push({
        type: stats.trend > 0 ? "warning" : "success",
        message: `Expenses ${stats.trend > 0 ? 'increased' : 'decreased'} by ${Math.abs(stats.trend).toFixed(1)}% compared to the previous period.`
      });
    }
    
    // Top category insight
    const topCategories = getTopCategories();
    if (topCategories.length > 0) {
      const topCategory = topCategories[0];
      const percentage = (topCategory.amount / stats.totalAmount) * 100;
      insights.push({
        type: "info",
        message: `Your highest spending category is "${topCategory.category}" at ${formatCurrency(topCategory.amount)} (${percentage.toFixed(1)}% of total).`
      });
    }
    
    // Frequency insight
    const now = new Date();
    const oldestExpense = new Date(filteredExpenses.reduce(
      (oldest, exp) => new Date(exp.created_at) < new Date(oldest) ? exp.created_at : oldest,
      now.toISOString()
    ));
    
    if (oldestExpense < now) {
      const daysDiff = Math.round((now.getTime() - oldestExpense.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0) {
        const frequency = stats.expenseCount / daysDiff;
        insights.push({
          type: "info",
          message: `You add approximately ${frequency.toFixed(1)} expenses per day.`
        });
      }
    }
    
    // Average expense insight
    if (stats.averageAmount > 0) {
      insights.push({
        type: "info",
        message: `Your average expense is ${formatCurrency(stats.averageAmount)}.`
      });
    }
    
    return insights;
  };
  
  // Format date for display
  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return "Any date";
    return formatDate(date.toISOString(), 'short');
  };
  
  // Loading state
  const isLoading = isExpensesLoading || isReportLoading;
  
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <Loader2 size={40} className="animate-spin text-[#1cc29f] mb-4" />
        <p className="text-gray-500">Loading analytics data...</p>
      </div>
    );
  }
  
  // Get statistics and insights
  const stats = calculateSummaryStats();
  const insights = getInsights();
  const topCategories = getTopCategories();
  const topSpenders = getTopSpenders();
  const trends = getExpenseTrends();
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Expense Analytics</h2>
          <p className="text-gray-500">
            Insights and trends for {groupId ? "this group" : "all your expenses"}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Timeframe Selector */}
          <Select value={timeframe} onValueChange={handleTimeframeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 3 months</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Custom Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10">
                <Calendar className="mr-2 h-4 w-4" />
                <span>
                  {dateRange.start && dateRange.end
                    ? `${formatDateForDisplay(dateRange.start)} - ${formatDateForDisplay(dateRange.end)}`
                    : "Date range"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex">
                <div className="border-r border-gray-200">
                  <div className="p-2 text-center font-medium">Start date</div>
                  <CalendarComponent
                    mode="single"
                    selected={dateRange.start || undefined}
                    onSelect={(date) => handleDateRangeChange({
                      start: date,
                      end: dateRange.end
                    })}
                    initialFocus
                  />
                </div>
                <div>
                  <div className="p-2 text-center font-medium">End date</div>
                  <CalendarComponent
                    mode="single"
                    selected={dateRange.end || undefined}
                    onSelect={(date) => handleDateRangeChange({
                      start: dateRange.start,
                      end: date
                    })}
                    initialFocus
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 p-3 flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => handleDateRangeChange({ start: null, end: null })}
                >
                  Clear
                </Button>
                <Button
                  onClick={() => {
                    // Apply date range
                    if (dateRange.start && dateRange.end) {
                      setTimeframe("custom");
                      generateReports(groupId);
                    }
                  }}
                  disabled={!dateRange.start || !dateRange.end}
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(stats.totalAmount)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {stats.trend !== 0 && (
                <>
                  {stats.trend > 0 ? (
                    <TrendingUp className="text-red-500 mr-1" size={16} />
                  ) : (
                    <TrendingDown className="text-green-500 mr-1" size={16} />
                  )}
                  <span className={stats.trend > 0 ? "text-red-500" : "text-green-500"}>
                    {Math.abs(stats.trend).toFixed(1)}%
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Number of Expenses */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Number of Expenses</CardDescription>
            <CardTitle className="text-2xl">
              {stats.expenseCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {timeframe === "all" ? "All time" : `In selected period`}
            </p>
          </CardContent>
        </Card>
        
        {/* Average Expense */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Expense</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(stats.averageAmount)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Per expense
            </p>
          </CardContent>
        </Card>
        
        {/* Highest Expense */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Highest Expense</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(stats.maxAmount)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Single expense
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Insights Section */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start">
                  {insight.type === "warning" && (
                    <div className="mt-0.5 mr-2 text-amber-500">
                      <AlertCircle size={16} />
                    </div>
                  )}
                  {insight.type === "success" && (
                    <div className="mt-0.5 mr-2 text-green-500">
                      <TrendingDown size={16} />
                    </div>
                  )}
                  {insight.type === "info" && (
                    <div className="mt-0.5 mr-2 text-blue-500">
                      <CreditCard size={16} />
                    </div>
                  )}
                  <span>{insight.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Tabs for Different Analytics Views */}
      <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Expense Trends Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseChart
              chartType="line"
              dataDimension="month"
              height={300}
              groupId={groupId}
              users={users}
              showControls={false}
            />
            
            <ExpenseChart
              chartType="pie"
              dataDimension="category"
              height={300}
              groupId={groupId}
              users={users}
              showControls={false}
            />
          </div>
          
          {/* Top Categories and Top Spenders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Spending Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {topCategories.length > 0 ? (
                  <ul className="space-y-3">
                    {topCategories.map((category, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-[#e4f9f5] flex items-center justify-center text-[#1cc29f] mr-3">
                            {index + 1}
                          </div>
                          <span>{category.category}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(category.amount)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">No category data available</p>
                )}
              </CardContent>
            </Card>
            
            {/* Top Spenders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Spenders</CardTitle>
              </CardHeader>
              <CardContent>
                {topSpenders.length > 0 ? (
                  <ul className="space-y-3">
                    {topSpenders.map((spender, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-[#e4f9f5] flex items-center justify-center text-[#1cc29f] mr-3">
                            {index + 1}
                          </div>
                          <span>{spender.name}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(spender.amount)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">No user data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="space-y-6">
            {/* Category Distribution Chart */}
            <ExpenseChart
              chartType={chartType}
              dataDimension="category"
              height={400}
              groupId={groupId}
              users={users}
              showControls={true}
            />
            
            {/* Category Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(expensesByCategory).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(expensesByCategory)
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, amount], index) => {
                        const percentage = (amount / stats.totalAmount) * 100;
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span>{category}</span>
                              <span className="font-medium">{formatCurrency(amount)}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div 
                                className="bg-[#1cc29f] h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              {percentage.toFixed(1)}% of total
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No category data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <div className="space-y-6">
            {/* User Distribution Chart */}
            <ExpenseChart
              chartType={chartType}
              dataDimension="user"
              height={400}
              groupId={groupId}
              users={users}
              showControls={true}
            />
            
            {/* User Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Spending Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(expensesByUser).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(expensesByUser)
                      .sort((a, b) => b[1] - a[1])
                      .map(([userId, amount], index) => {
                        const user = users.find(u => u.id === Number(userId));
                        const userName = user ? (user.id === currentUser?.id ? "You" : user.name) : `User ${userId}`;
                        const percentage = (amount / stats.totalAmount) * 100;
                        
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span>{userName}</span>
                              <span className="font-medium">{formatCurrency(amount)}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div 
                                className="bg-[#1cc29f] h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              {percentage.toFixed(1)}% of total
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No user data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpenseAnalytics;
