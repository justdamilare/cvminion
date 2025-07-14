import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/auth/AuthForm';
import { signIn } from '../lib/auth';
import { FadeIn } from '../components/ui/FadeIn';
import { Logo } from '../components/ui/Logo';

export const SignIn = () => {
  const navigate = useNavigate();

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark to-gray-900 flex flex-col items-center justify-center p-4 relative">
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
            <span className="text-white font-bold text-3xl tracking-tight leading-none">CVMinion</span>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Welcome back</h1>
          <p className="text-gray-400 text-lg">Sign in to continue building your career</p>
        </div>

        {/* Sign In Form Card */}
        <div className="bg-dark-light/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/50 shadow-2xl relative z-30">
          <AuthForm mode="signin" onSubmit={handleSignIn} />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 relative z-30">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary-dark font-medium transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </FadeIn>
    </div>
  );
};