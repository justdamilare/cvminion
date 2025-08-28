import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabaseClient } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/signin');
          return;
        }

        if (data.session) {
          // Check if this is a new user
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.session.user.id)
            .single();

          if (!profile) {
            // New user - create profile
            const { data: newProfile, error: profileError } = await supabase
              .from('profiles')
              .insert([{
                user_id: data.session.user.id,
                email: data.session.user.email,
                full_name: data.session.user.user_metadata?.full_name || 
                          data.session.user.user_metadata?.name || 
                          '',
                avatar_url: data.session.user.user_metadata?.avatar_url ||
                           data.session.user.user_metadata?.picture ||
                           null,
                subscription_tier: 'free',
                available_credits: 3,
                total_credits: 3,
                onboarding_completed: false,
                profile_completion_percentage: 10
              }])
              .select()
              .single();

            if (profileError) {
              console.error('Profile creation error:', profileError);
              toast.error('Failed to create profile. Please try again.');
              navigate('/signin');
              return;
            }

            toast.success('Welcome to CVMinion! Let\'s set up your profile.');
            navigate('/dashboard?welcome=true');
          } else {
            // Existing user
            toast.success('Welcome back!');
            navigate('/dashboard');
          }
        } else {
          // No session found
          navigate('/signin');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/signin');
      }
    };

    // Small delay to ensure URL parameters are available
    const timer = setTimeout(handleAuthCallback, 100);
    return () => clearTimeout(timer);
  }, [navigate, supabase]);

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-gray-400 mt-4">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;