import React, { useState, useRef } from 'react';
import { User, MapPin, Phone, Mail, Globe, Briefcase, Building2, ExternalLink, Camera, Check, AlertCircle, Save } from 'lucide-react';
import { Profile } from '../../types/profile';
import { EditableField } from '../ui/EditableField';

interface PersonalInfoProps {
  profile: Profile | null;
  onUpdate: (data: Partial<Profile>) => Promise<void>;
  showCompletionIndicators?: boolean;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ profile, onUpdate, showCompletionIndicators = false }) => {
  const [saving, setSaving] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save function with debouncing
  const handleAutoSave = async (data: Partial<Profile>) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        setSaving(true);
        await onUpdate(data);
      } finally {
        setSaving(false);
      }
    }, 1000);

    setAutoSaveTimeout(timeout);
  };

  // Field completion checker
  const isFieldComplete = (value: string | undefined, required = true) => {
    if (!required) return true;
    return value && value.trim().length > 0;
  };

  // Calculate section completion
  const getCompletionStats = () => {
    const requiredFields = [
      profile?.full_name,
      profile?.email,
      profile?.phone_number,
      profile?.address,
      profile?.title
    ];
    const completed = requiredFields.filter(field => isFieldComplete(field)).length;
    const total = requiredFields.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const completionStats = getCompletionStats();

  // Handle profile photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a storage service
      console.log('Photo selected:', file.name);
      // For now, just show that the feature exists
    }
  };
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-light dark:to-gray-900 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 shadow-xl transition-colors duration-300">
      {/* Completion Status Header */}
      {showCompletionIndicators && (
        <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 border-b border-primary/20 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                completionStats.percentage === 100 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              } transition-colors duration-300`}>
                {completionStats.percentage === 100 ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{completionStats.completed}</span>
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                  Personal Information
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  {completionStats.completed} of {completionStats.total} fields complete
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saving && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  <Save className="w-4 h-4 animate-pulse" />
                  Saving...
                </div>
              )}
              <div className="text-lg font-bold text-primary">
                {completionStats.percentage}%
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-1.5 mt-3 transition-colors duration-300">
            <div 
              className="h-1.5 rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500"
              style={{ width: `${completionStats.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="relative h-56 bg-gradient-to-br from-primary/20 via-primary-dark/10 to-transparent px-6 flex items-end pb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-yellow-600/5" />
        <div className="flex items-end gap-6 relative z-10">
          <div className="relative group">
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-light dark:to-gray-900 border-4 border-primary/30 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300">
              <User className="w-20 h-20 text-gray-500 dark:text-gray-400 group-hover:text-gray-400 dark:group-hover:text-gray-300 transition-colors" />
            </div>
            {/* Photo upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-all duration-200 hover:scale-110"
            >
              <Camera className="w-5 h-5 text-dark" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          <div className="mb-4 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <EditableField
                value={profile?.full_name ?? ''}
                onSave={(value) => handleAutoSave({ full_name: value })}
                className="text-4xl font-bold text-gray-900 dark:text-white block transition-colors duration-300"
                placeholder="Your Full Name"
              />
              {showCompletionIndicators && (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  isFieldComplete(profile?.full_name) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-orange-500 text-white'
                }`}>
                  {isFieldComplete(profile?.full_name) ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <EditableField
                value={profile?.title ?? ''}
                onSave={(value) => handleAutoSave({ title: value })}
                className="text-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                placeholder="Professional Title"
                icon={<Briefcase className="w-5 h-5" />}
              />
              {showCompletionIndicators && (
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  isFieldComplete(profile?.title) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-orange-500 text-white'
                }`}>
                  {isFieldComplete(profile?.title) ? (
                    <Check className="w-2.5 h-2.5" />
                  ) : (
                    <AlertCircle className="w-2.5 h-2.5" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 space-y-8">
        {/* Contact Information */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 dark:text-white text-xl font-semibold transition-colors duration-300">Contact Information</h3>
            {showCompletionIndicators && (
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Required fields marked with *
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="group">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Email Address *</label>
                  {showCompletionIndicators && (
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isFieldComplete(profile?.email) 
                        ? 'bg-green-500 text-white' 
                        : 'bg-orange-500 text-white'
                    }`}>
                      {isFieldComplete(profile?.email) ? (
                        <Check className="w-2.5 h-2.5" />
                      ) : (
                        <AlertCircle className="w-2.5 h-2.5" />
                      )}
                    </div>
                  )}
                </div>
                <EditableField
                  icon={<Mail className="w-5 h-5" />}
                  value={profile?.email ?? ''}
                  onSave={(value) => handleAutoSave({ email: value })}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              
              <div className="group">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Phone Number *</label>
                  {showCompletionIndicators && (
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isFieldComplete(profile?.phone_number) 
                        ? 'bg-green-500 text-white' 
                        : 'bg-orange-500 text-white'
                    }`}>
                      {isFieldComplete(profile?.phone_number) ? (
                        <Check className="w-2.5 h-2.5" />
                      ) : (
                        <AlertCircle className="w-2.5 h-2.5" />
                      )}
                    </div>
                  )}
                </div>
                <EditableField
                  icon={<Phone className="w-5 h-5" />}
                  value={profile?.phone_number ?? ''}
                  onSave={(value) => handleAutoSave({ phone_number: value })}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="group">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Location *</label>
                  {showCompletionIndicators && (
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isFieldComplete(profile?.address) 
                        ? 'bg-green-500 text-white' 
                        : 'bg-orange-500 text-white'
                    }`}>
                      {isFieldComplete(profile?.address) ? (
                        <Check className="w-2.5 h-2.5" />
                      ) : (
                        <AlertCircle className="w-2.5 h-2.5" />
                      )}
                    </div>
                  )}
                </div>
                <EditableField
                  icon={<MapPin className="w-5 h-5" />}
                  value={profile?.address ?? ''}
                  onSave={(value) => handleAutoSave({ address: value })}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Personal Website</label>
                <EditableField
                  icon={<Globe className="w-5 h-5" />}
                  value={profile?.website ?? ''}
                  onSave={(value) => handleAutoSave({ website: value })}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  placeholder="https://yourwebsite.com"
                  optional
                />
              </div>
              
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">LinkedIn Profile</label>
                <EditableField
                  icon={<ExternalLink className="w-5 h-5" />}
                  value={profile?.linkedin ?? ''}
                  onSave={(value) => handleAutoSave({ linkedin: value })}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  placeholder="https://linkedin.com/in/yourname"
                  optional
                />
              </div>
              
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">GitHub Profile</label>
                <EditableField
                  icon={<Building2 className="w-5 h-5" />}
                  value={profile?.github ?? ''}
                  onSave={(value) => handleAutoSave({ github: value })}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  placeholder="https://github.com/yourusername"
                  optional
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 dark:text-white text-xl font-semibold transition-colors duration-300">Professional Summary</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
              {(profile?.summary ?? '').length}/500 characters
            </div>
          </div>
          
          <div className="relative">
            <textarea
              value={profile?.summary ?? ''}
              onChange={(e) => handleAutoSave({ summary: e.target.value })}
              className="w-full h-40 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark dark:to-gray-900 text-gray-900 dark:text-white px-6 py-4 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none resize-none border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 focus:border-primary transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Write a compelling professional summary that highlights your key strengths, experiences, and career objectives. This is your elevator pitch - make it count!"
              maxLength={500}
            />
            
            {/* Character count indicator */}
            <div className={`absolute bottom-3 right-3 text-xs ${
              (profile?.summary ?? '').length > 400 ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'
            } transition-colors duration-300`}>
              {500 - (profile?.summary ?? '').length} remaining
            </div>
          </div>
          
          {/* Summary tips */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-2 transition-colors duration-300">💡 Tips for a great summary:</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-400 space-y-1 transition-colors duration-300">
              <li>• Start with your current role and years of experience</li>
              <li>• Highlight your key skills and technologies</li>
              <li>• Mention notable achievements or projects</li>
              <li>• End with your career goals or what you're passionate about</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
