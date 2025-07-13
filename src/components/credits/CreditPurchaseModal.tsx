import React, { useState, useEffect } from 'react';
import { X, Coins, Check, Loader2, CreditCard } from 'lucide-react';
import { formatPrice } from '../../types/credits';
import { getSupabaseClient } from '../../lib/supabase';
import { StripePaymentModal } from '../payments/StripePaymentModal';
import { toast } from 'react-hot-toast';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  description?: string;
}

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onPurchaseSuccess?: () => void;
}

export const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({
  isOpen,
  onClose,
  userId,
  onPurchaseSuccess
}) => {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('is_active', true)
        .order('credits', { ascending: true });

      if (error) throw error;
      
      const packagesData = data as unknown as CreditPackage[];
      setPackages(packagesData);
      
      // Select the first package by default
      if (packagesData.length > 0) {
        setSelectedPackage(packagesData[0].id);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load credit packages');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    if (!selectedPackage || !userId) return;
    setShowStripeModal(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-light rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Coins className="w-5 h-5 mr-2 text-primary" />
            Purchase Credits
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPackage === pkg.id
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPackage === pkg.id
                          ? 'border-primary bg-primary'
                          : 'border-gray-400'
                      }`}>
                        {selectedPackage === pkg.id && (
                          <Check className="w-2 h-2 text-dark" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{pkg.name}</h3>
                        {pkg.description && (
                          <p className="text-gray-400 text-sm">{pkg.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold text-lg">
                        {formatPrice(pkg.price_cents)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {(pkg.price_cents / 100 / pkg.credits).toFixed(2)}¢/credit
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h4 className="text-white font-medium mb-2">What you get:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Credits never expire (12 months from purchase)</li>
                <li>• Use credits for AI-powered CV generation</li>
                <li>• Credits work across all subscription tiers</li>
                <li>• Secure payment processing</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={!selectedPackage}
                className="flex-1 bg-primary text-dark py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Purchase Credits
              </button>
            </div>

            {/* Stripe Payment Modal */}
            {userId && (
              <StripePaymentModal
                isOpen={showStripeModal}
                onClose={() => setShowStripeModal(false)}
                userId={userId}
                mode="credits"
                selectedCreditPackage={packages.find(p => p.id === selectedPackage)}
                onSuccess={() => {
                  setShowStripeModal(false);
                  onPurchaseSuccess?.();
                  onClose();
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}; 
