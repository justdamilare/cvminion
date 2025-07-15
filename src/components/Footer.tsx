import React from 'react';
import { Mail } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-dark-light border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
            &copy; {currentYear} CVMinion. All rights reserved.
          </div>
          
          {/* Support Email */}
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <a 
              href="mailto:support@cvminion.com" 
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              support@cvminion.com
            </a>
          </div>
          
          {/* Legal Notice */}
          <div className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">
            Based in Germany • GDPR Compliant
          </div>
        </div>
      </div>
    </footer>
  );
};
