import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  // If less than 7 days ago, show relative time
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  // Otherwise show formatted date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format budget range based on min, max, and type
 */
export function formatBudget(
  min: number | undefined,
  max: number | undefined,
  type: 'fixed' | 'hourly'
): string {
  const prefix = type === 'hourly' ? '/hr' : '';
  
  if (!min && !max) return 'Budget not specified';
  
  if (min && max && min !== max) {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}${prefix}`;
  }
  
  const amount = min || max;
  return `$${amount?.toLocaleString()}${prefix}`;
}
