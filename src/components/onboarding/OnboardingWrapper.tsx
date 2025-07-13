import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCredits } from '../../hooks/useCredits';
import { useProfile } from '../../hooks/useProfile';
import { WelcomeModal } from './WelcomeModal';
import { SubscriptionSetupModal } from './SubscriptionSetupModal';
import { ProfileSetupGuide } from './ProfileSetupGuide';
import { getSupabaseClient } from '../../lib/supabase';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

type OnboardingStep = 'welcome' | 'subscription' | 'profile' | 'completed' | null;

export const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  const { user } = useAuth();
  const { subscriptionTier } = useCredits(user?.id);
  const { profile, refreshProfile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Check URL parameters for onboarding triggers
  const searchParams = new URLSearchParams(location.search);
  const showWelcome = searchParams.get('welcome') === 'true';
  const setupSubscription = searchParams.get('setup-subscription') === 'true';

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const supabase = getSupabaseClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserProfile(profile);
      
      // Determine onboarding step
      if (showWelcome) {
        setCurrentStep('welcome');
      } else if (setupSubscription) {
        setCurrentStep('subscription');
      } else if (profile?.onboarding_completed === false || !isProfileComplete()) {
        // Check what step they're on
        const step = profile?.onboarding_step;
        if (step === 'welcome') {
          setCurrentStep('welcome');
        } else if (step === 'payment' || step === 'subscription') {
          setCurrentStep('subscription');
        } else if (step === 'profile' || !isProfileComplete()) {
          setCurrentStep('profile');
        } else {
          setCurrentStep('welcome'); // Default to welcome for new users
        }
      } else {
        setCurrentStep('completed');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setCurrentStep('completed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOnboardingStep = async (step: string) => {
    if (!user) return;

    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('profiles')
        .update({ onboarding_step: step })
        .eq('user_id', user.id);

      setUserProfile(prev => ({ ...prev, onboarding_step: step }));
    } catch (error) {
      console.error('Error updating onboarding step:', error);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_step: 'completed'
        })
        .eq('user_id', user.id);

      setUserProfile(prev => ({ ...prev, onboarding_completed: true, onboarding_step: 'completed' }));
      setCurrentStep('completed');
      
      // Clean up URL parameters
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleWelcomeComplete = () => {
    // Get the selected plan from localStorage (set during signup)
    const selectedPlan = localStorage.getItem('selectedPlan');
    
    if (selectedPlan && selectedPlan !== 'free') {
      setCurrentStep('subscription');
      updateOnboardingStep('subscription');
    } else {
      setCurrentStep('profile');
      updateOnboardingStep('profile');
    }
    
    // Clean up URL parameters
    const newUrl = location.pathname;
    navigate(newUrl, { replace: true });
  };

  const handleSubscriptionComplete = () => {
    // Clear the selected plan from localStorage
    localStorage.removeItem('selectedPlan');
    setCurrentStep('profile');
    updateOnboardingStep('profile');
  };

  const handleSubscriptionSkip = () => {
    // User chose to skip subscription setup (maybe they want to stay free)
    localStorage.removeItem('selectedPlan');
    setCurrentStep('profile');
    updateOnboardingStep('profile');
  };

  const handleProfileComplete = () => {
    completeOnboarding();
    refreshProfile(); // Refresh profile data after completion
  };

  const handleProfileSkip = () => {
    completeOnboarding();
  };

  // Check if profile is sufficiently complete to skip onboarding
  const isProfileComplete = () => {
    if (!profile) return false;
    
    // Check basic completion criteria
    const hasBasicInfo = profile.full_name && profile.email && profile.phone_number;
    const hasProfessionalInfo = profile.title && profile.summary && profile.summary.length > 50;
    const hasExperience = profile.experience && profile.experience.length > 0;
    const hasSkills = profile.skills && profile.skills.length >= 3;
    
    return hasBasicInfo && hasProfessionalInfo && (hasExperience || hasSkills);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Don't show onboarding for users without profiles or if onboarding is completed
  if (!user || !userProfile || currentStep === 'completed' || currentStep === null) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={currentStep === 'welcome'}
        onComplete={handleWelcomeComplete}
        userProfile={userProfile}
      />

      {/* Subscription Setup Modal */}
      <SubscriptionSetupModal
        isOpen={currentStep === 'subscription'}
        onComplete={handleSubscriptionComplete}
        onSkip={handleSubscriptionSkip}
        selectedPlan={localStorage.getItem('selectedPlan') as any}
      />

      {/* Profile Setup Guide */}
      <ProfileSetupGuide
        isOpen={currentStep === 'profile'}
        onComplete={handleProfileComplete}
        onSkip={handleProfileSkip}
        userProfile={userProfile}
      />
    </>
  );
};