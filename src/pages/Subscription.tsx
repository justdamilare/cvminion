import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SimpleSubscriptionManager } from '../components/billing/SimpleSubscriptionManager';
import { getSupabaseClient } from '../lib/supabase';

export const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);
      } catch (error) {
        console.error('Error getting current user:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-white">Unable to load subscription information.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Subscription Manager */}
        <SimpleSubscriptionManager userId={userId} />
      </div>
    </div>
  );
};

export default SubscriptionPage;