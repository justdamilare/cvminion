import React from 'react';
import { Coins, Loader2 } from 'lucide-react';
import { useCredits } from '../../hooks/useCredits';
import { getTierColor, getTierDisplayName } from '../../types/credits';

interface CreditBalanceProps {
  userId?: string;
  className?: string;
}

export const CreditBalance: React.FC<CreditBalanceProps> = ({ userId, className = '' }) => {
  const { availableCredits, subscriptionTier, loading } = useCredits(userId);

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-gray-500 dark:text-gray-400 transition-colors duration-300" />
        <span className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Coins className="w-4 h-4 text-primary" />
      <span className="text-gray-700 dark:text-white text-sm font-medium transition-colors duration-300">
        {availableCredits} credits
      </span>
      <span className={`text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-800 ${getTierColor(subscriptionTier)} transition-colors duration-300`}>
        {getTierDisplayName(subscriptionTier)}
      </span>
    </div>
  );
}; 
