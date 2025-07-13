import React from 'react';
import { EnhancedSubscriptionManager } from './EnhancedSubscriptionManager';

interface SubscriptionManagerProps {
  userId: string;
}

/**
 * Legacy SubscriptionManager component that now uses the enhanced version
 * This maintains backward compatibility while providing all the new features
 */
export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ userId }) => {
  return <EnhancedSubscriptionManager userId={userId} />;
}; 
