import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Stats } from '../components/landing/Stats';
import { Pricing } from '../components/landing/Pricing';

export const Landing = () => {
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark flex items-center justify-center transition-colors duration-300">
        <div className="text-gray-900 dark:text-white transition-colors duration-300">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <Hero />
        <Features />
        <Stats />
      </div>
      <HowItWorks />
      <Pricing />
    </div>
  );
};

export default Landing;
