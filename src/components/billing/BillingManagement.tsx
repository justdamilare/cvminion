import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Plus,
  Settings,
  Calendar,
  Receipt,
  ExternalLink,
  Trash2,
  Star
} from 'lucide-react';
import { BillingHistory, PaymentMethod } from '../../types/billing';
import { formatCurrency, formatDate, getBillingStatusColor } from '../../types/billing';

interface BillingManagementProps {
  billingHistory: BillingHistory[];
  paymentMethods: PaymentMethod[];
  onDownloadInvoice: (invoiceId: string) => void;
  onRetryPayment: (invoiceId: string) => void;
  onSetDefaultPaymentMethod: (paymentMethodId: string) => void;
  onRemovePaymentMethod: (paymentMethodId: string) => void;
  onAddPaymentMethod: () => void;
  loading?: boolean;
  billingHistoryLoading?: boolean;
  paymentMethodsLoading?: boolean;
}

export const BillingManagement: React.FC<BillingManagementProps> = ({
  billingHistory,
  paymentMethods,
  onDownloadInvoice,
  onRetryPayment,
  onSetDefaultPaymentMethod,
  onRemovePaymentMethod,
  onAddPaymentMethod,
  loading = false,
  billingHistoryLoading = false,
  paymentMethodsLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'payment-methods'>('history');
  const [removingPaymentMethod, setRemovingPaymentMethod] = useState<string | null>(null);

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    setRemovingPaymentMethod(paymentMethodId);
    try {
      await onRemovePaymentMethod(paymentMethodId);
    } finally {
      setRemovingPaymentMethod(null);
    }
  };

  const getCardBrandIcon = (brand: string) => {
    // Return appropriate icon based on card brand
    // For now, using generic CreditCard icon
    return <CreditCard className="w-5 h-5" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <RefreshCw className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-dark-light rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Billing Management</h2>
            <p className="text-gray-400">Manage your payment methods and billing history</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-primary text-dark'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4 mr-2 inline" />
              History
            </button>
            <button
              onClick={() => setActiveTab('payment-methods')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'payment-methods'
                  ? 'bg-primary text-dark'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2 inline" />
              Payment Methods
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Billing History Tab */}
        {activeTab === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Billing History</h3>
              <p className="text-gray-400 text-sm">Last 20 transactions</p>
            </div>

            {billingHistoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-gray-400">Loading billing history...</span>
              </div>
            ) : billingHistory.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h4 className="text-gray-400 font-medium mb-2">No billing history</h4>
                <p className="text-gray-500 text-sm">Your billing history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {billingHistory.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">
                          {getStatusIcon(item.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-white font-medium">{item.description}</h4>
                            <span className={`text-sm ${getBillingStatusColor(item.status)}`}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">
                            {formatDate(item.created_at)} • 
                            Invoice #{item.stripe_invoice_id.slice(-8)}
                          </p>
                          {item.billing_period_start && item.billing_period_end && (
                            <p className="text-gray-500 text-xs mt-1">
                              Billing period: {formatDate(item.billing_period_start)} - {formatDate(item.billing_period_end)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-white font-semibold mb-2">
                          {formatCurrency(item.amount, item.currency)}
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.invoice_url && (
                            <button
                              onClick={() => window.open(item.invoice_url, '_blank')}
                              className="text-gray-400 hover:text-white p-1 rounded"
                              title="View invoice"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                          {item.invoice_pdf && (
                            <button
                              onClick={() => onDownloadInvoice(item.stripe_invoice_id)}
                              className="text-gray-400 hover:text-white p-1 rounded"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          {item.status === 'failed' && (
                            <button
                              onClick={() => onRetryPayment(item.stripe_invoice_id)}
                              className="text-primary hover:text-primary-dark p-1 rounded"
                              title="Retry payment"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payment-methods' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
              <button
                onClick={onAddPaymentMethod}
                className="flex items-center space-x-2 bg-primary text-dark px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Payment Method</span>
              </button>
            </div>

            {paymentMethodsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-gray-400">Loading payment methods...</span>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h4 className="text-gray-400 font-medium mb-2">No payment methods</h4>
                <p className="text-gray-500 text-sm mb-4">Add a payment method to manage your subscription</p>
                <button
                  onClick={onAddPaymentMethod}
                  className="bg-primary text-dark px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
                >
                  Add Payment Method
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    className={`bg-gray-800/50 rounded-lg p-4 border transition-colors ${
                      method.is_default 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          method.is_default ? 'bg-primary/20 text-primary' : 'bg-gray-700 text-gray-400'
                        }`}>
                          {method.type === 'card' && method.card ? 
                            getCardBrandIcon(method.card.brand) : 
                            <CreditCard className="w-5 h-5" />
                          }
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            {method.type === 'card' && method.card ? (
                              <>
                                <h4 className="text-white font-medium capitalize">
                                  {method.card.brand} •••• {method.card.last4}
                                </h4>
                                {method.is_default && (
                                  <span className="flex items-center bg-primary text-dark px-2 py-1 rounded-full text-xs font-bold">
                                    <Star className="w-3 h-3 mr-1" />
                                    Default
                                  </span>
                                )}
                              </>
                            ) : method.type === 'bank_account' && method.bank_account ? (
                              <>
                                <h4 className="text-white font-medium">
                                  {method.bank_account.bank_name || 'Bank Account'} •••• {method.bank_account.last4}
                                </h4>
                                {method.is_default && (
                                  <span className="bg-primary text-dark px-2 py-1 rounded-full text-xs font-bold">
                                    Default
                                  </span>
                                )}
                              </>
                            ) : (
                              <h4 className="text-white font-medium">Payment Method</h4>
                            )}
                          </div>
                          
                          {method.type === 'card' && method.card && (
                            <p className="text-gray-400 text-sm">
                              Expires {method.card.exp_month.toString().padStart(2, '0')}/{method.card.exp_year} • 
                              {method.card.funding.charAt(0).toUpperCase() + method.card.funding.slice(1)} card
                            </p>
                          )}
                          
                          <p className="text-gray-500 text-xs">
                            Added {formatDate(method.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!method.is_default && (
                          <button
                            onClick={() => onSetDefaultPaymentMethod(method.stripe_payment_method_id)}
                            className="text-gray-400 hover:text-white px-3 py-1 text-sm border border-gray-600 hover:border-gray-500 rounded transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleRemovePaymentMethod(method.stripe_payment_method_id)}
                          disabled={removingPaymentMethod === method.stripe_payment_method_id}
                          className="text-red-400 hover:text-red-300 p-2 rounded transition-colors disabled:opacity-50"
                          title="Remove payment method"
                        >
                          {removingPaymentMethod === method.stripe_payment_method_id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Method Info */}
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <Settings className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-blue-400 font-medium mb-2">Payment Method Tips</h4>
                  <ul className="text-blue-300 text-sm space-y-1">
                    <li>• Your default payment method will be used for subscription renewals</li>
                    <li>• You can update your payment method at any time</li>
                    <li>• We securely store your payment information with Stripe</li>
                    <li>• Failed payments will automatically retry with your default method</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};