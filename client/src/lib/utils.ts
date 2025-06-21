import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: INR)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = "INR"): string {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

/**
 * Format a date in a user-friendly way
 * @param dateString - ISO date string
 * @param format - Format type ('short', 'long', 'relative')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, format: 'short' | 'long' | 'relative' = 'short'): string {
  const date = new Date(dateString);
  
  if (format === 'relative') {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    // Fall back to short format for older dates
    format = 'short';
  }
  
  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a percentage value
 * @param value - Percentage value (0-100)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Truncate a string if it exceeds a maximum length
 * @param str - String to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Get initials from a name
 * @param name - Full name
 * @returns Initials (up to 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate a color based on a string (useful for user avatars)
 * @param str - Input string (like user name)
 * @returns Tailwind CSS color class
 */
export function stringToColor(str: string): string {
  if (!str) return 'bg-gray-400';
  
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Determine if a user is owed money (positive balance)
 * @param amount - Balance amount
 * @returns Boolean indicating if user is owed money
 */
export function isUserOwed(amount: number): boolean {
  return amount > 0;
}

/**
 * Calculate equal splits for an expense
 * @param amount - Total expense amount
 * @param numberOfPeople - Number of people to split between
 * @returns Amount per person
 */
export function calculateEqualSplit(amount: number, numberOfPeople: number): number {
  if (numberOfPeople <= 0) return 0;
  return parseFloat((amount / numberOfPeople).toFixed(2));
}

/**
 * Calculate percentage splits for an expense
 * @param amount - Total expense amount
 * @param percentages - Array of percentage values (should sum to 100)
 * @returns Array of monetary amounts
 */
export function calculatePercentageSplits(amount: number, percentages: number[]): number[] {
  return percentages.map(percentage => 
    parseFloat(((percentage / 100) * amount).toFixed(2))
  );
}

/**
 * Validate an email address format
 * @param email - Email address to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Generate a random avatar URL (for demo purposes)
 * @returns URL to a random avatar image
 */
export function getRandomAvatarUrl(): string {
  const randomId = Math.floor(Math.random() * 1000);
  return `https://i.pravatar.cc/150?img=${randomId}`;
}
