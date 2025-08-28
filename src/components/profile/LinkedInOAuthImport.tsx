import React, { useState } from 'react';
import { Linkedin, Download, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { signInWithLinkedIn } from '../../lib/auth';
import { extractLinkedInData, showLinkedInImportSuccess } from '../../lib/linkedinImport';
import { getSupabaseClient } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

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
  const { user } = useAuth();
  const supabase = getSupabaseClient();

  const handleLinkedInConnect = async () => {
    if (!user) {
      toast.error('Please sign in to connect LinkedIn');
      return;
    }

    console.log('Starting LinkedIn import for user:', {
      userId: user.id,
      email: user.email,
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
      
      console.log('User object for LinkedIn check:', {
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata,
        identities: user.identities,
        linkedinProvider
      });
      
      // Extract available LinkedIn data from user metadata (try even if provider detection fails)
      const linkedinData = extractLinkedInData(user.user_metadata);
      
      if (!linkedinProvider) {
        // Check if we have LinkedIn data even though provider detection failed
        if (linkedinData && Object.keys(linkedinData).length > 0) {
          console.log('Found LinkedIn data despite provider detection failure');
          // Continue with import
        } else {
          // If not connected and no data, initiate LinkedIn OAuth to connect account
          toast.info('Connecting to LinkedIn...');
          await signInWithLinkedIn();
          return;
        }
      }
      
      if (!linkedinData || Object.keys(linkedinData).length === 0) {
        toast.error('No LinkedIn data available to import. Try signing in with LinkedIn first.');
        setImportStatus('error');
        return;
      }

      // Update profile with LinkedIn data
      const updateData: any = {};
      const importedFields: string[] = [];

      if (linkedinData.full_name) {
        updateData.full_name = linkedinData.full_name;
        importedFields.push('name');
      }

      if (linkedinData.headline) {
        updateData.bio = linkedinData.headline;
        importedFields.push('headline');
      }

      if (linkedinData.avatar_url) {
        updateData.avatar_url = linkedinData.avatar_url;
        importedFields.push('profile picture');
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
              ? "Import your basic LinkedIn profile data to quickly populate your resume."
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
          <div><strong>Quick Import includes:</strong> Name, Professional Headline, Profile Picture</div>
          <div><strong>Note:</strong> For complete work history, education, and skills, use the full LinkedIn export feature above.</div>
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