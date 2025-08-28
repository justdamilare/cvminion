import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabaseClient } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { extractLinkedInData, showLinkedInImportSuccess } from '../lib/linkedinImport';

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
            // Extract provider-specific data
            const userMetadata = data.session.user.user_metadata;
            const provider = data.session.user.app_metadata?.provider;
            
            let profileData: any = {
              user_id: data.session.user.id,
              email: data.session.user.email,
              subscription_tier: 'free',
              available_credits: 3,
              total_credits: 3,
              onboarding_completed: false,
              profile_completion_percentage: 10
            };

            let importedFields: string[] = [];
            
            if (provider === 'linkedin_oidc') {
              // Extract LinkedIn data using the import service
              const linkedinData = extractLinkedInData(userMetadata);
              
              if (linkedinData.full_name) {
                profileData.full_name = linkedinData.full_name;
                importedFields.push('name');
              }
              
              if (linkedinData.headline) {
                profileData.bio = linkedinData.headline;
                importedFields.push('headline');
              }
              
              if (linkedinData.avatar_url) {
                profileData.avatar_url = linkedinData.avatar_url;
                importedFields.push('profile picture');
              }
              
              // Higher completion percentage for LinkedIn users
              profileData.profile_completion_percentage = 20 + (importedFields.length * 5);
              
            } else if (provider === 'google') {
              profileData.full_name = userMetadata?.full_name || userMetadata?.name || '';
              profileData.avatar_url = userMetadata?.avatar_url || userMetadata?.picture || null;
              
              if (profileData.full_name) importedFields.push('name');
              if (profileData.avatar_url) importedFields.push('profile picture');
            }

            // New user - create profile with provider-specific data
            const { data: newProfile, error: profileError } = await supabase
              .from('profiles')
              .insert([profileData])
              .select()
              .single();

            if (profileError) {
              console.error('Profile creation error:', profileError);
              toast.error('Failed to create profile. Please try again.');
              navigate('/signin');
              return;
            }

            // Show import success message for LinkedIn users
            if (provider === 'linkedin_oidc' && importedFields.length > 0) {
              showLinkedInImportSuccess(importedFields);
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