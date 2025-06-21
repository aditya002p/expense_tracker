/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import { useReportStore } from '@/store';
import { User } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Loader2, PieChart as PieChartIcon, BarChart3, LineChart as LineChartIcon } from 'lucide-react';

// Chart type options
export type ChartType = 'bar' | 'pie' | 'line' | 'area';

// Data visualization dimension
export type DataDimension = 'category' | 'user' | 'month' | 'splitType';

interface ExpenseChartProps {
  chartType?: ChartType;
  dataDimension?: DataDimension;
  groupId?: number;
  height?: number | string;
  users?: User[];
  className?: string;
  showControls?: boolean;
}

const ExpenseChart = ({
  chartType: initialChartType = 'bar',
  dataDimension: initialDataDimension = 'category',
  groupId,
  height = 300,
  users = [],
  className = '',
  showControls = true
}: ExpenseChartProps) => {
  // Local state for chart configuration
  const [chartType, setChartType] = useState<ChartType>(initialChartType);
  const [dataDimension, setDataDimension] = useState<DataDimension>(initialDataDimension);
  
  // Get data from report store
  const { 
    expensesByCategory, 
    expensesByMonth, 
    expensesByUser,
    isLoading,
    error,
    generateReports,
    dateRange,
    setDateRange
  } = useReportStore();
  
  // Generate reports when component mounts or configuration changes
  useEffect(() => {
    if (groupId !== undefined) {
      generateReports(groupId);
    }
  }, [groupId, dateRange]); // Remove generateReports from dependencies
  
  // Format data for the selected dimension
  const getChartData = () => {
    switch (dataDimension) {
      case 'category':
        return Object.entries(expensesByCategory).map(([category, amount]) => ({
          name: category,
          value: amount
        }));
      case 'month':
        return Object.entries(expensesByMonth)
          .sort() // Sort by month chronologically
          .map(([month, amount]) => ({
            name: formatMonthLabel(month),
            value: amount
          }));
      case 'user':
        return Object.entries(expensesByUser).map(([userId, amount]) => {
          const user = users.find(u => u.id === Number(userId));
          return {
            name: user ? (user.id === 1 ? 'You' : user.name) : `User ${userId}`,
            value: amount,
            userId: Number(userId)
          };
        });
      default:
        return [];
    }
  };
  
  // Format month label (e.g., "2025-06" to "Jun 2025")
  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  
  // Generate colors for chart elements
  const getChartColors = () => {
    return [
      '#1cc29f', // Primary teal
      '#8357e6', // Secondary purple
      '#ff5252', // Red
      '#ffb74d', // Orange
      '#4caf50', // Green
      '#2196f3', // Blue
      '#9c27b0', // Purple
      '#ff9800', // Deep orange
      '#607d8b', // Blue grey
      '#795548', // Brown
    ];
  };
  
  // Custom tooltip formatter
  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100">
          <p className="font-medium">{label}</p>
          <p className="text-[#1cc29f]">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Render the appropriate chart based on selected type and dimension
  const renderChart = () => {
    const data = getChartData();
    const colors = getChartColors();
    
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value).replace('₹', '').trim()}
              />
              <Tooltip content={renderTooltip} />
              <Legend />
              <Bar dataKey="value" fill={colors[0]} name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value).replace('₹', '').trim()}
              />
              <Tooltip content={renderTooltip} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]} 
                activeDot={{ r: 8 }}
                name="Amount"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value).replace('₹', '').trim()}
              />
              <Tooltip content={renderTooltip} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]} 
                fill={colors[0]} 
                fillOpacity={0.3}
                name="Amount"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };
  
  // Get chart data for use outside renderChart function
  const chartData = getChartData();
  
  // Loading state
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center h-[${typeof height === 'number' ? `${height}px` : height}] ${className}`}>
        <Loader2 size={40} className="animate-spin text-[#1cc29f] mb-4" />
        <p className="text-gray-500">Loading chart data...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center h-[${typeof height === 'number' ? `${height}px` : height}] ${className}`}>
        <p className="text-red-500 mb-2">Failed to load chart data</p>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Chart Title and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="font-semibold text-lg mb-2 sm:mb-0">
          {dataDimension === 'category' && 'Expenses by Category'}
          {dataDimension === 'user' && 'Expenses by User'}
          {dataDimension === 'month' && 'Expenses by Month'}
        </h3>
        
        {showControls && (
          <div className="flex space-x-2">
            {/* Chart Type Selector */}
            <div className="flex rounded-md overflow-hidden border border-gray-200">
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 ${chartType === 'bar' ? 'bg-[#e4f9f5] text-[#1cc29f]' : 'bg-white text-gray-600'}`}
                title="Bar Chart"
              >
                <BarChart3 size={18} />
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`p-2 ${chartType === 'pie' ? 'bg-[#e4f9f5] text-[#1cc29f]' : 'bg-white text-gray-600'}`}
                title="Pie Chart"
              >
                <PieChartIcon size={18} />
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`p-2 ${chartType === 'line' ? 'bg-[#e4f9f5] text-[#1cc29f]' : 'bg-white text-gray-600'}`}
                title="Line Chart"
              >
                <LineChartIcon size={18} />
              </button>
            </div>
            
            {/* Data Dimension Selector */}
            <select
              value={dataDimension}
              onChange={(e) => setDataDimension(e.target.value as DataDimension)}
              className="rounded-md border border-gray-200 text-sm px-2"
            >
              <option value="category">By Category</option>
              <option value="user">By User</option>
              <option value="month">By Month</option>
            </select>
          </div>
        )}
      </div>
      
      {/* Chart Visualization */}
      <div className="w-full">
        {renderChart()}
      </div>
      
      {/* Chart Legend for Mobile (if needed) */}
      {chartType !== 'pie' && chartData.length > 0 && (
        <div className="mt-4 sm:hidden">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Legend</h4>
          <div className="flex flex-wrap gap-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-1" 
                  style={{ backgroundColor: getChartColors()[index % getChartColors().length] }}
                />
                <span className="text-xs">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;