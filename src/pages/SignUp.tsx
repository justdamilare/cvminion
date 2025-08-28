import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithGoogle, signInWithLinkedIn } from '../lib/auth';
import { FadeIn } from '../components/ui/FadeIn';
import { Logo } from '../components/ui/Logo';
import { toast } from 'react-hot-toast';

export const SignUp = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleGoogleSignUp = async () => {
    setIsLoading('google');
    try {
      await signInWithGoogle();
      // OAuth redirect will handle navigation
    } catch (error) {
      console.error('Google sign up error:', error);
      toast.error('Failed to sign up with Google. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleLinkedInSignUp = async () => {
    setIsLoading('linkedin');
    try {
      await signInWithLinkedIn();
      // OAuth redirect will handle navigation
    } catch (error) {
      console.error('LinkedIn sign up error:', error);
      toast.error('Failed to sign up with LinkedIn. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-dark dark:via-dark dark:to-gray-900 flex flex-col items-center justify-center p-4 relative transition-colors duration-300">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0"></div>
      {/* Decorative Elements */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl z-0"></div>
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl z-0"></div>
      
      <FadeIn className="w-full max-w-md relative z-20">
        {/* Logo and Branding */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center space-x-3 mb-8 group relative z-30">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors flex items-center justify-center">
              <Logo className="w-10 h-10" />
            </div>
            <span className="text-gray-900 dark:text-white font-bold text-3xl tracking-tight leading-none transition-colors duration-300">CVMinion</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight transition-colors duration-300">Create your account</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg transition-colors duration-300">Join thousands building better careers</p>
        </div>

        {/* OAuth Sign Up Card */}
        <div className="bg-white/80 dark:bg-dark-light/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 shadow-2xl relative z-30 transition-colors duration-300">
          <div className="space-y-4">
            {/* Google Sign Up */}
            <button
              onClick={handleGoogleSignUp}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading === 'google' ? 'Creating account...' : 'Sign up with Google'}
            </button>

            {/* LinkedIn Sign Up */}
            <button
              onClick={handleLinkedInSignUp}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              <svg className="w-5 h-5 mr-3" fill="#0A66C2" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              {isLoading === 'linkedin' ? 'Creating account...' : 'Sign up with LinkedIn'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-dark-light text-gray-500 dark:text-gray-400">
                  Why CVMinion?
                </span>
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                AI-powered resume optimization
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                ATS-friendly templates
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Job application tracking
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:text-primary-dark">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:text-primary-dark">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 relative z-30">
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Already have an account?{' '}
            <Link to="/signin" className="text-primary hover:text-primary-dark font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </FadeIn>
    </div>
  );
};

export default SignUp;