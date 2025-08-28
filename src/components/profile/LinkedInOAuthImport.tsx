import React, { useState, useEffect } from 'react';
import { Linkedin, Download, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { signInWithLinkedIn } from '../../lib/auth';
import { extractLinkedInData, showLinkedInImportSuccess } from '../../lib/linkedinImport';
import { getComprehensiveLinkedInData } from '../../lib/linkedinAPI';
import { getSupabaseClient } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { User } from '@supabase/supabase-js';

interface LinkedInOAuthImportProps {
  onImportComplete?: () => void;
  className?: string;
}

export const LinkedInOAuthImport: React.FC<LinkedInOAuthImportProps> = ({
  onImportComplete,
  className = ''
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [user, setUser] = useState<User | null>(null);
  const { isAuthenticated } = useAuth();
  const supabase = getSupabaseClient();

  // Get user from Supabase when component mounts
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
        console.log('LinkedInOAuthImport - current user:', currentUser);
      } catch (error) {
        console.error('Failed to get user:', error);
      }
    };

    if (isAuthenticated) {
      getUser();
    }
  }, [isAuthenticated, supabase]);

  const handleTestButton = () => {
    console.log('=== SIMPLE TEST ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    toast.success('Test button clicked! Check console for debug info.');
  };

  const handleLinkedInConnect = async () => {
    console.log('=== LINKEDIN IMPORT DEBUG START ===');
    console.log('1. Authentication state:', { 
      isAuthenticated,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email 
    });
    
    if (!isAuthenticated) {
      console.error('❌ FAILED: User not authenticated');
      toast.error('Please sign in to connect LinkedIn');
      return;
    }
    
    if (!user) {
      console.error('❌ FAILED: No user object available');
      toast.error('Loading user data... Please try again in a moment.');
      return;
    }
    
    console.log('✅ PASSED: Authentication checks');

    console.log('2. User details:', {
      userId: user.id,
      email: user.email,
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at
    });
    
    console.log('3. User metadata:', {
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata,
      identities: user.identities
    });

    setIsImporting(true);
    setImportStatus('idle');

    try {
      // Check if user is already connected with LinkedIn
      // Multiple ways to check for LinkedIn connection
      const linkedinProvider = 
        user.app_metadata?.providers?.includes('linkedin_oidc') ||
        user.app_metadata?.provider === 'linkedin_oidc' ||
        user.user_metadata?.iss?.includes('linkedin') ||
        user.identities?.some(identity => identity.provider === 'linkedin_oidc');
      
      console.log('4. LinkedIn provider detection:', {
        linkedinProvider,
        checkDetails: {
          providers_includes: user.app_metadata?.providers?.includes('linkedin_oidc'),
          provider_equals: user.app_metadata?.provider === 'linkedin_oidc',
          iss_includes: user.user_metadata?.iss?.includes('linkedin'),
          identities_check: user.identities?.some(identity => identity.provider === 'linkedin_oidc')
        }
      });
      
      // Try comprehensive LinkedIn API import first
      let profileData: any = null;
      let importMethod = 'basic';
      
      try {
        // Attempt comprehensive API import
        console.log('Attempting comprehensive LinkedIn API import...');
        profileData = await getComprehensiveLinkedInData(user.id);
        importMethod = 'comprehensive';
        console.log('Comprehensive LinkedIn data retrieved:', profileData);
      } catch (apiError) {
        console.log('API import failed, falling back to basic OAuth data:', apiError);
        
        // Fallback to basic OAuth data
        const linkedinData = extractLinkedInData(user.user_metadata);
        if (linkedinData && Object.keys(linkedinData).length > 0) {
          profileData = {
            full_name: linkedinData.full_name,
            bio: linkedinData.headline,
            avatar_url: linkedinData.avatar_url
          };
          importMethod = 'basic';
        }
      }
      
      if (!linkedinProvider && !profileData) {
        // If not connected and no data, initiate LinkedIn OAuth to connect account
        toast.info('Connecting to LinkedIn...');
        await signInWithLinkedIn();
        return;
      }
      
      if (!profileData) {
        toast.error('No LinkedIn data available to import. Try signing in with LinkedIn first.');
        setImportStatus('error');
        return;
      }

      // Update profile with LinkedIn data
      const updateData: any = {};
      const importedFields: string[] = [];

      // Handle comprehensive data
      if (importMethod === 'comprehensive') {
        // Map comprehensive data
        if (profileData.full_name) {
          updateData.full_name = profileData.full_name;
          importedFields.push('name');
        }
        
        if (profileData.title) {
          updateData.title = profileData.title;
          importedFields.push('professional title');
        }
        
        if (profileData.summary) {
          updateData.bio = profileData.summary;
          importedFields.push('professional summary');
        }
        
        if (profileData.avatar_url) {
          updateData.avatar_url = profileData.avatar_url;
          importedFields.push('profile picture');
        }
        
        if (profileData.experience && profileData.experience.length > 0) {
          updateData.experience = profileData.experience;
          importedFields.push(`${profileData.experience.length} work experiences`);
        }
        
        if (profileData.education && profileData.education.length > 0) {
          updateData.education = profileData.education;
          importedFields.push(`${profileData.education.length} education entries`);
        }
        
        if (profileData.skills && profileData.skills.length > 0) {
          updateData.skills = profileData.skills;
          importedFields.push(`${profileData.skills.length} skills`);
        }
        
        toast.success('🚀 Comprehensive LinkedIn import successful!');
      } else {
        // Handle basic data
        if (profileData.full_name) {
          updateData.full_name = profileData.full_name;
          importedFields.push('name');
        }

        if (profileData.bio) {
          updateData.bio = profileData.bio;
          importedFields.push('headline');
        }

        if (profileData.avatar_url) {
          updateData.avatar_url = profileData.avatar_url;
          importedFields.push('profile picture');
        }
        
        toast.success('✅ Basic LinkedIn import successful!');
      }

      if (Object.keys(updateData).length === 0) {
        toast.info('No new LinkedIn data to import');
        return;
      }

      // Update the profile
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('LinkedIn import error:', error);
        toast.error('Failed to import LinkedIn data');
        setImportStatus('error');
        return;
      }

      setImportStatus('success');
      showLinkedInImportSuccess(importedFields);
      onImportComplete?.();

    } catch (error) {
      console.error('LinkedIn import error:', error);
      toast.error('Failed to import LinkedIn data');
      setImportStatus('error');
    } finally {
      setIsImporting(false);
    }
  };

  const isLinkedInConnected = 
    user?.app_metadata?.providers?.includes('linkedin_oidc') ||
    user?.app_metadata?.provider === 'linkedin_oidc' ||
    user?.user_metadata?.iss?.includes('linkedin') ||
    user?.identities?.some(identity => identity.provider === 'linkedin_oidc');

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Linkedin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Quick Import from LinkedIn
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {isLinkedInConnected 
              ? "Import your LinkedIn profile data. We'll try comprehensive import first, then fall back to basic data if needed."
              : "Connect your LinkedIn account to import your professional information instantly."
            }
          </p>
          
          {importStatus === 'success' && (
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 text-sm mb-4">
              <CheckCircle className="w-4 h-4" />
              <span>LinkedIn data imported successfully!</span>
            </div>
          )}
          
          {importStatus === 'error' && (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm mb-4">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to import LinkedIn data. Please try again.</span>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLinkedInConnect}
              disabled={isImporting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isImporting ? (
                <>
                  <Download className="w-4 h-4 mr-2 animate-spin" />
                  {isLinkedInConnected ? 'Importing...' : 'Connecting...'}
                </>
              ) : (
                <>
                  <Linkedin className="w-4 h-4 mr-2" />
                  {isLinkedInConnected ? 'Import Data' : 'Connect LinkedIn'}
                </>
              )}
            </button>
            
            {/* Debug test button */}
            <button
              onClick={handleTestButton}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              🐛 Debug
            </button>

            {/* Link to full LinkedIn import for more comprehensive data */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Want more data?{' '}
              <button
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center"
                onClick={() => {
                  // This would trigger the full LinkedIn import modal
                  toast.info('Full LinkedIn import coming soon! Use the file upload method for now.');
                }}
              >
                Full import <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <div><strong>Comprehensive Import (API):</strong> Work experience, education, skills, certifications</div>
          <div><strong>Basic Import (OAuth):</strong> Name, professional headline, profile picture</div>
          <div><strong>Note:</strong> We attempt comprehensive import first, then fall back to basic data. For manual control, use the LinkedIn export feature above.</div>
        </div>
      </div>
      
      {isLinkedInConnected && (
        <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400">
          <CheckCircle className="w-3 h-3 mr-1" />
          LinkedIn account connected
        </div>
      )}
    </div>
  );
};