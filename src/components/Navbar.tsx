import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, LogOut, User, Plus, Settings, Menu, X } from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';
import { CreditBalance } from './credits/CreditBalance';
import { CreditPurchaseModal } from './credits/CreditPurchaseModal';

export const Navbar = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const navigate = useNavigate();
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      const getCurrentUser = async () => {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);
      };
      getCurrentUser();
    }
  }, [isAuthenticated]);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-dark px-6 py-4 relative">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Brain className="w-8 h-8 text-primary" />
          <span className="text-white font-bold text-xl">CVMinion</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-white hover:text-primary inline-flex items-center transition-colors duration-200">
                Dashboard
              </Link>
              <Link to="/profile" className="text-white hover:text-primary inline-flex items-center transition-colors duration-200">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
              <Link to="/subscription" className="text-white hover:text-primary inline-flex items-center transition-colors duration-200">
                <Settings className="w-4 h-4 mr-2" />
                Subscription
              </Link>
              <CreditBalance userId={userId || undefined} />
              <button
                onClick={() => setShowCreditModal(true)}
                className="text-primary hover:text-primary-dark inline-flex items-center bg-primary bg-opacity-10 px-3 py-1 rounded-lg transition-all duration-200 hover:bg-opacity-20"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span>Buy Credits</span>
              </button>
              <button
                onClick={handleSignOut}
                className="text-white hover:text-primary inline-flex items-center transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="text-white hover:text-primary transition-colors duration-200">
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-primary text-dark px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors duration-200"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:text-primary transition-colors duration-200 p-2"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div 
        className={`lg:hidden absolute top-full left-0 right-0 bg-dark-light border-t border-gray-700 shadow-lg transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'opacity-100 translate-y-0 visible' 
            : 'opacity-0 -translate-y-2 invisible'
        }`}
      >
        <div className="px-6 py-4 space-y-4">
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className="text-white hover:text-primary inline-flex items-center w-full py-2 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/profile" 
                className="text-white hover:text-primary inline-flex items-center w-full py-2 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
              <Link 
                to="/subscription" 
                className="text-white hover:text-primary inline-flex items-center w-full py-2 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Subscription
              </Link>
              
              {/* Credit Balance on Mobile */}
              <div className="py-2 border-t border-gray-600">
                <CreditBalance userId={userId || undefined} />
              </div>
              
              <button
                onClick={() => {
                  setShowCreditModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="text-primary hover:text-primary-dark inline-flex items-center bg-primary bg-opacity-10 px-3 py-2 rounded-lg w-full justify-center transition-all duration-200 hover:bg-opacity-20"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span>Buy Credits</span>
              </button>
              
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="text-white hover:text-primary inline-flex items-center w-full py-2 border-t border-gray-600 pt-4 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/signin" 
                className="text-white hover:text-primary w-full py-2 block transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-primary text-dark px-4 py-2 rounded-lg font-medium hover:bg-primary-dark w-full text-center block transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[-1]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <CreditPurchaseModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        userId={userId || undefined}
        onPurchaseSuccess={() => {
          // The CreditBalance component will automatically refresh
          setShowCreditModal(false);
        }}
      />
    </nav>
  );
};
