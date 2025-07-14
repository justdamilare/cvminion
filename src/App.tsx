import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Landing } from './pages/Landing';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { ProfilePage } from './pages/Profile';
import { SubscriptionPage } from './pages/Subscription';
import { Navbar } from './components/Navbar';
import { ConnectSupabase } from './components/ui/ConnectSupabase';
import { OnboardingWrapper } from './components/onboarding/OnboardingWrapper';
import { GuidedProfileWizard } from './components/profile/GuidedProfileWizard';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { CheckoutReturn } from './components/payments/CheckoutReturn';
import { Profile } from './types/profile';

// Profile Wizard Page Component
const ProfileWizardPage = () => {
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/profile', { replace: true });
  };

  const handleUpdate = async (data: Partial<Profile>) => {
    await updateProfile(data);
  };

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-4xl mx-auto">
        <GuidedProfileWizard
          profile={profile}
          onUpdate={handleUpdate}
          onComplete={handleComplete}
          isNewUser={false}
        />
      </div>
    </div>
  );
};

function App() {
  const { isAuthenticated, isLoading, error } = useAuth();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  // Show the connect Supabase component if there's a configuration error
  if (error?.includes('Missing Supabase configuration')) {
    return <ConnectSupabase />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-dark">
        <Navbar isAuthenticated={isAuthenticated} />
        <OnboardingWrapper>
          <Routes>
            <Route 
              path="/" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} 
            />
            <Route 
              path="/signin" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignIn />} 
            />
            <Route 
              path="/signup" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignUp />} 
            />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" />} 
            />
            <Route 
              path="/profile" 
              element={isAuthenticated ? <ProfilePage /> : <Navigate to="/signin" />} 
            />
            <Route 
              path="/profile/wizard" 
              element={isAuthenticated ? <ProfileWizardPage /> : <Navigate to="/signin" />} 
            />
            <Route 
              path="/subscription" 
              element={isAuthenticated ? <SubscriptionPage /> : <Navigate to="/signin" />} 
            />
            <Route path="/checkout/return" element={<CheckoutReturn />} />
          </Routes>
        </OnboardingWrapper>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
