import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ConnectSupabase } from './components/ui/ConnectSupabase';
import { OnboardingWrapper } from './components/onboarding/OnboardingWrapper';
import { GuidedProfileWizard } from './components/profile/GuidedProfileWizard';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { Profile } from './types/profile';
import { ThemeProvider } from './contexts/ThemeContext';
import { Analytics } from '@vercel/analytics/react';
import { PageErrorBoundary } from './components/ui/ErrorBoundary';
import { PageLoadingSpinner } from './components/ui/LoadingSpinner';

// Lazy load heavy components
const Landing = lazy(() => import('./pages/Landing'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const SubscriptionPage = lazy(() => import('./pages/Subscription'));
const CheckoutReturn = lazy(() => import('./components/payments/CheckoutReturn'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

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
    <div className="min-h-screen bg-white dark:bg-dark p-6 transition-colors duration-300">
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

// Component to conditionally show footer on public pages
const ConditionalFooter = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Show footer on public pages (non-authenticated pages)
  const publicPages = ['/', '/signin', '/signup'];
  const shouldShowFooter = !isAuthenticated || publicPages.includes(location.pathname);
  
  return shouldShowFooter ? <Footer /> : null;
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
    <PageErrorBoundary>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-white dark:bg-dark transition-colors duration-300">
            <Navbar isAuthenticated={isAuthenticated} />
            <OnboardingWrapper>
              <Suspense fallback={<PageLoadingSpinner />}>
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
                  <Route path="/auth/callback" element={<AuthCallback />} />
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
              </Suspense>
            </OnboardingWrapper>
            <ConditionalFooter />
            <Toaster position="top-right" />
            <Analytics />
          </div>
        </Router>
      </ThemeProvider>
    </PageErrorBoundary>
  );
}

export default App;
