import React from 'react';
import { Plus } from 'lucide-react';
import { GradientBorder } from '../ui/GradientBorder';

interface DashboardHeaderProps {
  onNewApplication: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onNewApplication }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Applications</h1>
        <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Track and manage your job applications</p>
      </div>
      
      <GradientBorder>
        <button
          onClick={onNewApplication}
          className="bg-primary text-dark px-4 py-2 rounded-lg font-bold inline-flex items-center space-x-2 hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Application</span>
        </button>
      </GradientBorder>
    </div>
  );
};