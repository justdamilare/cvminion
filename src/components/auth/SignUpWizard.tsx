import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, Loader2 } from 'lucide-react';
import { PlanSelection } from './PlanSelection';
import { AuthForm } from './AuthForm';
import { FadeIn } from '../ui/FadeIn';
import { signUp } from '../../lib/auth';
import { subscriptionPlans, SubscriptionTier } from '../../config/stripe';
import { getSupabaseClient } from '../../lib/supabase';

type WizardStep = 'plan-selection' | 'account-creation';

export const SignUpWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>('plan-selection');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('plus');
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanSelection = (plan: SubscriptionTier) => {
    setSelectedPlan(plan);
  };

  const handleContinueToPlan = () => {
    setCurrentStep('account-creation');
  };

  const handleBackToPlans = () => {
    setCurrentStep('plan-selection');
  };

  const handleSignUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Create user account
      const { user } = await signUp(email, password);
      
      if (!user) {
        throw new Error('Failed to create account');
      }

      // If user selected a paid plan, we'll handle subscription creation after account setup
      if (selectedPlan !== 'free') {
        // Store the selected plan in user metadata or localStorage for later processing
        localStorage.setItem('selectedPlan', selectedPlan);
      }

      // Set initial subscription tier in user profile
      const supabase = getSupabaseClient();
      await supabase
        .from('profiles')
        .update({ 
          subscription_tier: selectedPlan,
          onboarding_step: selectedPlan === 'free' ? 'welcome' : 'payment'
        })
        .eq('user_id', user.id);

      // Navigate to dashboard or payment setup
      if (selectedPlan === 'free') {
        navigate('/dashboard?welcome=true');
      } else {
        navigate('/dashboard?setup-subscription=true');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      // Error handling is done by the AuthForm component
    } finally {
      setIsLoading(false);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 'plan-selection':
        return (
          <PlanSelection
            selectedPlan={selectedPlan}
            onPlanSelect={handlePlanSelection}
            onContinue={handleContinueToPlan}
          />
        );
      
      case 'account-creation':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToPlans}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
                <p className="text-gray-400">
                  Selected: {subscriptionPlans[selectedPlan].name} Plan
                  {selectedPlan !== 'free' && (
                    <button
                      onClick={handleBackToPlans}
                      className="ml-2 text-primary hover:text-primary-dark text-sm"
                      disabled={isLoading}
                    >
                      (Change)
                    </button>
                  )}
                </p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">
                    {subscriptionPlans[selectedPlan].name} Plan
                  </div>
                  <div className="text-sm text-gray-400">
                    {subscriptionPlans[selectedPlan].credits} credits per month
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">
                    {selectedPlan === 'free' 
                      ? 'Free' 
                      : `$${(subscriptionPlans[selectedPlan].price / 100).toFixed(2)}/month`
                    }
                  </div>
                  {selectedPlan !== 'free' && (
                    <div className="text-xs text-green-400">14-day free trial</div>
                  )}
                </div>
              </div>
            </div>

            <AuthForm 
              mode="signup" 
              onSubmit={handleSignUp}
              isLoading={isLoading}
              submitText={
                selectedPlan === 'free' 
                  ? 'Create Free Account' 
                  : `Start ${subscriptionPlans[selectedPlan].name} Trial`
              }
            />

            <div className="text-center text-xs text-gray-400">
              {selectedPlan === 'free' ? (
                'You can upgrade to a paid plan anytime from your dashboard'
              ) : (
                'Your 14-day trial starts immediately. No charges until trial ends. Cancel anytime.'
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4">
      <FadeIn className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-white font-bold text-2xl">CVMinion</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className={`flex items-center space-x-2 ${
              currentStep === 'plan-selection' ? 'text-primary' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep === 'plan-selection' ? 'border-primary bg-primary text-dark' : 'border-gray-600'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Choose Plan</span>
            </div>
            
            <div className="w-8 h-px bg-gray-600"></div>
            
            <div className={`flex items-center space-x-2 ${
              currentStep === 'account-creation' ? 'text-primary' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep === 'account-creation' ? 'border-primary bg-primary text-dark' : 'border-gray-600'
              }`}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  '2'
                )}
              </div>
              <span className="text-sm font-medium">Create Account</span>
            </div>
          </div>
        </div>

        <div className="bg-dark-light rounded-xl p-8 border border-gray-800">
          {getStepContent()}
        </div>

        <p className="text-center mt-8 text-gray-400">
          Already have an account?{' '}
          <Link to="/signin" className="text-primary hover:text-primary-dark">
            Sign in
          </Link>
        </p>
      </FadeIn>
    </div>
  );
};