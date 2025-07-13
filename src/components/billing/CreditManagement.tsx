import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ShoppingCart, 
  Clock, 
  TrendingUp, 
  BarChart3,
  Calendar,
  RefreshCw,
  Star,
  AlertTriangle,
  Coins,
  History
} from 'lucide-react';
import { creditPackages } from '../../config/stripe';
import { CreditBalance } from '../../types/billing';
import { CreditTransaction } from '../../types/credits';
import { formatCurrency, formatDate, getDaysUntil } from '../../types/billing';

interface CreditManagementProps {
  creditBalance: CreditBalance | null;
  creditTransactions: CreditTransaction[];
  onPurchaseCredits: (packageId: string) => void;
  onRefreshCredits: () => void;
  loading?: boolean;
  transactionsLoading?: boolean;
}

interface CreditUsageChart {
  date: string;
  used: number;
  remaining: number;
}

export const CreditManagement: React.FC<CreditManagementProps> = ({
  creditBalance,
  creditTransactions,
  onPurchaseCredits,
  onRefreshCredits,
  loading = false,
  transactionsLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'history'>('overview');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // Calculate usage trends
  const calculateUsageTrend = () => {
    if (!creditTransactions.length) return { trend: 'stable', percentage: 0 };
    
    const last7Days = creditTransactions
      .filter(t => t.transaction_type === 'consumed')
      .slice(0, 7)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const previous7Days = creditTransactions
      .filter(t => t.transaction_type === 'consumed')
      .slice(7, 14)
      .reduce((sum, t) => sum + t.amount, 0);
    
    if (previous7Days === 0) return { trend: 'stable', percentage: 0 };
    
    const percentage = ((last7Days - previous7Days) / previous7Days) * 100;
    
    return {
      trend: percentage > 10 ? 'increasing' : percentage < -10 ? 'decreasing' : 'stable',
      percentage: Math.abs(percentage)
    };
  };

  const usageTrend = calculateUsageTrend();

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'consumed':
        return <Zap className="w-4 h-4 text-red-400" />;
      case 'purchased':
        return <ShoppingCart className="w-4 h-4 text-blue-400" />;
      case 'expired':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <Coins className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTransactionDescription = (transaction: CreditTransaction) => {
    switch (transaction.transaction_type) {
      case 'earned':
        return transaction.description || 'Monthly credit allocation';
      case 'consumed':
        return transaction.description || 'CV generation';
      case 'purchased':
        return transaction.description || 'Credit purchase';
      case 'expired':
        return transaction.description || 'Credits expired';
      default:
        return transaction.description || 'Credit transaction';
    }
  };

  return (
    <div className="bg-dark-light rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Credit Management</h2>
            <p className="text-gray-400">Track your credits and purchase additional ones</p>
          </div>
          
          <button
            onClick={onRefreshCredits}
            disabled={loading}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 mr-2 inline" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'packages'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4 mr-2 inline" />
          Buy Credits
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4 mr-2 inline" />
          Transaction History
        </button>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Credit Balance Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Total Available */}
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-primary font-medium">Total Available</h3>
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {creditBalance?.total_available || 0}
                </div>
                <p className="text-gray-400 text-sm">Credits ready to use</p>
              </div>

              {/* Monthly Credits */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-300 font-medium">Monthly Credits</h3>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {creditBalance?.monthly_remaining || 0}
                </div>
                <p className="text-gray-400 text-sm">
                  of {creditBalance?.monthly_credits || 0} remaining
                </p>
              </div>

              {/* Purchased Credits */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-300 font-medium">Purchased</h3>
                  <ShoppingCart className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {creditBalance?.purchased_remaining || 0}
                </div>
                <p className="text-gray-400 text-sm">Never expire</p>
              </div>
            </div>

            {/* Usage Trend */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Usage Trend</h3>
                <div className={`flex items-center space-x-2 ${
                  usageTrend.trend === 'increasing' ? 'text-red-400' :
                  usageTrend.trend === 'decreasing' ? 'text-green-400' :
                  'text-gray-400'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${
                    usageTrend.trend === 'decreasing' ? 'rotate-180' : ''
                  }`} />
                  <span className="text-sm">
                    {usageTrend.trend === 'stable' ? 'Stable usage' :
                     `${usageTrend.percentage.toFixed(1)}% ${usageTrend.trend}`}
                  </span>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Credit usage compared to previous week
              </p>
            </div>

            {/* Expiring Credits Warning */}
            {creditBalance?.expires_soon && creditBalance.expires_soon.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-400 font-medium mb-2">Credits Expiring Soon</h4>
                    <div className="space-y-1">
                      {creditBalance.expires_soon.map((item, index) => (
                        <p key={index} className="text-yellow-300 text-sm">
                          {item.amount} credits expire on {formatDate(item.expires_at)}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Purchase CTA */}
            <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium mb-1">Need More Credits?</h4>
                  <p className="text-gray-400 text-sm">Purchase credits that never expire</p>
                </div>
                <button
                  onClick={() => setActiveTab('packages')}
                  className="bg-primary text-dark px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                >
                  Buy Credits
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Credit Packages Tab */}
        {activeTab === 'packages' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Credit Packages</h3>
              <p className="text-gray-400">Purchase additional credits that never expire</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {creditPackages.map((pkg) => (
                <div 
                  key={pkg.id}
                  className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    pkg.popular 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                  }`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  {/* Popular Badge */}
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-dark px-3 py-1 rounded-full text-xs font-bold flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        Best Value
                      </span>
                    </div>
                  )}

                  {/* Package Content */}
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                      pkg.popular ? 'bg-primary text-dark' : 'bg-gray-700 text-gray-300'
                    }`}>
                      <Zap className="w-6 h-6" />
                    </div>
                    
                    <h4 className="text-white font-bold text-lg mb-1">{pkg.name}</h4>
                    <p className="text-gray-400 text-sm mb-3">{pkg.description}</p>
                    
                    <div className="text-center mb-4">
                      <span className="text-2xl font-bold text-white">
                        {formatCurrency(pkg.price)}
                      </span>
                      <p className="text-gray-400 text-sm">
                        ${(pkg.price / 100 / pkg.credits).toFixed(2)} per credit
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPurchaseCredits(pkg.id);
                      }}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        pkg.popular 
                          ? 'bg-primary text-dark hover:bg-primary-dark' 
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                    >
                      Purchase {pkg.credits} Credits
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Package Benefits */}
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <Coins className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-blue-400 font-medium mb-2">Credit Package Benefits</h4>
                  <ul className="text-blue-300 text-sm space-y-1">
                    <li>• Credits never expire - use them whenever you need</li>
                    <li>• Instant activation after successful payment</li>
                    <li>• Can be used alongside your monthly subscription credits</li>
                    <li>• Perfect for busy periods or special projects</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History Tab */}
        {activeTab === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Transaction History</h3>
              <p className="text-gray-400 text-sm">Last 50 transactions</p>
            </div>

            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-gray-400">Loading transaction history...</span>
              </div>
            ) : creditTransactions.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h4 className="text-gray-400 font-medium mb-2">No transactions yet</h4>
                <p className="text-gray-500 text-sm">Your credit transaction history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {creditTransactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-700 rounded-lg">
                          {getTransactionIcon(transaction.transaction_type)}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">
                            {formatTransactionDescription(transaction)}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-semibold ${
                          transaction.transaction_type === 'consumed' || transaction.transaction_type === 'expired'
                            ? 'text-red-400' 
                            : 'text-green-400'
                        }`}>
                          {transaction.transaction_type === 'consumed' || transaction.transaction_type === 'expired' 
                            ? '-' 
                            : '+'
                          }{transaction.amount} credits
                        </div>
                        <div className="text-gray-400 text-sm">
                          Balance: {transaction.balance_after}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};