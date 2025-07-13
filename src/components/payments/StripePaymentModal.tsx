import React, { useState, useEffect } from 'react';
import { X, Crown, Zap } from 'lucide-react';
import { subscriptionPlans, creditPackages } from '../../config/stripe';
import { PaymentForm } from './PaymentForm';

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: () => void;
  mode: 'credits' | 'subscription';
  selectedPlan?: keyof typeof subscriptionPlans;
  selectedCredits?: number;
}

export const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess,
  mode,
  selectedPlan,
  selectedCredits
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');

  useEffect(() => {
    if (mode === 'subscription' && selectedPlan) {
      setSelectedOption(selectedPlan);
    } else if (mode === 'credits' && selectedCredits) {
      const creditPackage = creditPackages.find(pkg => pkg.credits === selectedCredits);
      if (creditPackage) {
        setSelectedOption(creditPackage.id);
      }
    }
  }, [mode, selectedPlan, selectedCredits]);

  if (!isOpen) return null;

  const getSelectedData = () => {
    if (mode === 'subscription') {
      return subscriptionPlans[selectedOption as keyof typeof subscriptionPlans];
    } else {
      return creditPackages.find(pkg => pkg.id === selectedOption);
    }
  };

  const selectedData = getSelectedData();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-light rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            {mode === 'subscription' ? (
              <Crown className="w-5 h-5 text-primary" />
            ) : (
              <Zap className="w-5 h-5 text-primary" />
            )}
            <h2 className="text-xl font-bold text-white">
              {mode === 'subscription' ? 'Upgrade Subscription' : 'Purchase Credits'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Option Selection */}
          {!selectedPlan && !selectedCredits && (
            <div className="mb-6">
              <h3 className="text-white font-medium mb-4">
                {mode === 'subscription' ? 'Choose Your Plan' : 'Select Credit Package'}
              </h3>
              <div className="space-y-3">
                {mode === 'subscription' ? (
                  Object.entries(subscriptionPlans)
                    .filter(([key]) => key !== 'free')
                    .map(([key, plan]) => (
                      <div
                        key={key}
                        onClick={() => setSelectedOption(key)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedOption === key
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-white font-medium">{plan.name}</h4>
                            <p className="text-gray-400 text-sm">{plan.credits} credits/month</p>
                          </div>
                          <span className="text-primary font-bold">
                            ${(plan.price / 100).toFixed(2)}/mo
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  creditPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedOption(pkg.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedOption === pkg.id
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-600 hover:border-gray-500'
                      } ${pkg.popular ? 'ring-2 ring-primary' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-white font-medium">{pkg.name}</h4>
                            {pkg.popular && (
                              <span className="bg-primary text-dark text-xs px-2 py-1 rounded-full font-bold">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{pkg.description}</p>
                        </div>
                        <span className="text-primary font-bold">
                          ${(pkg.price / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Selected Option Summary */}
          {selectedData && (
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <h4 className="text-white font-medium mb-2">Order Summary</h4>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">{selectedData.name}</span>
                <span className="text-white font-bold">
                  ${(selectedData.price / 100).toFixed(2)}
                  {mode === 'subscription' && '/month'}
                </span>
              </div>
              {mode === 'credits' && (
                <p className="text-gray-400 text-sm">
                  {selectedData.credits} credits • Never expires
                </p>
              )}
              {mode === 'subscription' && (
                <p className="text-gray-400 text-sm">
                  {selectedData.credits} credits per month • Auto-renewal
                </p>
              )}
            </div>
          )}

          {/* Payment Form */}
          {selectedData && (
            <PaymentForm
              mode={mode}
              selectedData={selectedData}
              userId={userId}
              onSuccess={() => {
                onSuccess?.();
                onClose();
              }}
              onError={(error: Error) => {
                console.error('Payment error:', error);
              }}
            />
          )}


        </div>
      </div>
    </div>
  );
}; 
