import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Loader } from 'lucide-react';
import { GradientBorder } from '../ui/GradientBorder';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  submitText?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, isLoading: externalLoading, submitText }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [internalLoading, setInternalLoading] = React.useState(false);
  
  const loading = externalLoading ?? internalLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (externalLoading === undefined) {
      setInternalLoading(true);
    }
    try {
      await onSubmit(email, password);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      if (externalLoading === undefined) {
        setInternalLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-dark-light text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-dark-light text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Enter your password"
            required
          />
        </div>
      </div>

      <GradientBorder>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-dark font-bold py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-primary-dark transition-colors"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <span>{submitText || (mode === 'signin' ? 'Sign In' : 'Sign Up')}</span>
          )}
        </button>
      </GradientBorder>
    </form>
  );
};