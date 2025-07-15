import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useProfile } from '../hooks/useProfile';
import { PersonalInfo } from '../components/profile/PersonalInfo';
import { ExperienceSection } from '../components/profile/ExperienceSection';
import { EducationSection } from '../components/profile/EducationSection';
import { SkillsSection } from '../components/profile/SkillsSection';
import { LanguagesSection } from '../components/profile/LanguagesSection';
import { ImportSection } from '../components/profile/ImportSection';
import { ProfileProgress } from '../components/profile/ProfileProgress';
import { ProfileStrengthDashboard } from '../components/profile/ProfileStrengthDashboard';
import { GuidedProfileWizard } from '../components/profile/GuidedProfileWizard';
import { Profile } from '../types/profile';
import { ProjectSection } from '../components/profile/ProjectsSection';
import { CertificationsSection } from '../components/profile/CertificationsSection';
import { Settings, Zap, Target, BarChart3, User } from 'lucide-react';

export const ProfilePage = () => {
  const { 
    profile, 
    loading, 
    updating, 
    completionPercentage,
    updateProfile: updateProfileData, 
    refreshProfile 
  } = useProfile();
  const [activeView, setActiveView] = useState<'standard' | 'wizard' | 'dashboard'>('standard');
  const [showCompletionIndicators, setShowCompletionIndicators] = useState(true);

  // Check if this is a new user (minimal profile data)
  const isNewUser = !profile?.summary || profile.summary.length < 50;

  const handleUpdateProfile = async (data: Partial<Profile>) => {
    try {
      await updateProfileData(data);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile: ' + error.message);
    }
  };

  const handleImportProfile = async (data: Partial<Profile>) => {
    try {
      await updateProfileData(data);
      toast.success('LinkedIn profile imported successfully!');
      // Refresh to ensure we have the latest data
      setTimeout(() => refreshProfile(), 1000);
    } catch (error: any) {
      toast.error('Failed to import profile: ' + error.message);
      throw error; // Re-throw to let the import component handle it
    }
  };

  const handleSectionClick = (section: string) => {
    // Scroll to section when clicked from progress component
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWizardComplete = () => {
    setActiveView('standard');
    toast.success('Profile setup completed! 🎉');
    refreshProfile();
  };

  const handleImprovementAction = (recommendation: string) => {
    // Handle improvement recommendations
    if (recommendation.includes('summary')) {
      document.getElementById('personal_information')?.scrollIntoView({ behavior: 'smooth' });
    } else if (recommendation.includes('experience')) {
      document.getElementById('work_experience')?.scrollIntoView({ behavior: 'smooth' });
    } else if (recommendation.includes('skills')) {
      document.getElementById('skills_expertise')?.scrollIntoView({ behavior: 'smooth' });
    }
    toast.info('💡 ' + recommendation);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark p-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show wizard for new users or when explicitly requested
  if (activeView === 'wizard') {
    return (
      <div className="min-h-screen bg-white dark:bg-dark p-6 transition-colors duration-300">
        <GuidedProfileWizard
          profile={profile}
          onUpdate={handleUpdateProfile}
          onComplete={handleWizardComplete}
          isNewUser={isNewUser}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* New User Welcome Banner */}
        {completionPercentage < 30 && (
          <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 border border-primary/30 rounded-xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Welcome to CVMinion! 🚀</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">
                  Let's get your profile set up to start creating amazing resumes and landing interviews.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  <span>Current completion: {completionPercentage}%</span>
                  <div className="w-full sm:w-32 bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveView('wizard')}
                className="bg-primary text-dark font-bold px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <Zap className="w-4 md:w-5 h-4 md:h-5" />
                <span className="text-sm md:text-base">Quick Setup (5 min)</span>
              </button>
            </div>
          </div>
        )}
        {/* Header with View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Profile Management</h1>
              <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full w-fit transition-colors duration-300">
                <div className={`w-3 h-3 rounded-full ${
                  completionPercentage >= 80 ? 'bg-green-500' :
                  completionPercentage >= 60 ? 'bg-yellow-500' :
                  completionPercentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
                }`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{completionPercentage}% Complete</span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Build and maintain your professional profile</p>
            {completionPercentage < 100 && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                💡 Complete your profile to improve job application success
              </div>
            )}
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1 transition-colors duration-300">
              <button
                onClick={() => setActiveView('standard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'standard' 
                    ? 'bg-primary text-dark' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                Standard
              </button>
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'dashboard' 
                    ? 'bg-primary text-dark' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
            </div>
            
            <button
              onClick={() => setActiveView('wizard')}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-dark font-semibold px-4 py-2 rounded-lg hover:from-primary-dark hover:to-primary transition-all"
            >
              <Zap className="w-4 h-4" />
              Quick Setup
            </button>
            
            <button
              onClick={() => setShowCompletionIndicators(!showCompletionIndicators)}
              className={`p-2 rounded-lg transition-colors ${
                showCompletionIndicators 
                  ? 'bg-primary text-dark' 
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
              }`}
              title="Toggle completion indicators"
            >
              <Target className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard View */}
        {activeView === 'dashboard' ? (
          <div className="space-y-8">
            <ProfileStrengthDashboard
              profile={profile}
              onImprove={handleImprovementAction}
            />
          </div>
        ) : (
          /* Standard View */
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              <div id="personal_information">
                <PersonalInfo 
                  profile={profile} 
                  onUpdate={handleUpdateProfile}
                  showCompletionIndicators={showCompletionIndicators}
                />
              </div>
              
              <div id="work_experience">
                <ExperienceSection 
                  experience={profile?.experience || []} 
                  onUpdate={handleUpdateProfile}
                  showCompletionIndicators={showCompletionIndicators}
                />
              </div>
              
              <div id="education">
                <EducationSection 
                  education={profile?.education || []} 
                  onUpdate={handleUpdateProfile}
                  showCompletionIndicators={showCompletionIndicators}
                />
              </div>
              
              <div id="skills_expertise">
                <SkillsSection 
                  skills={profile?.skills || []} 
                  onUpdate={handleUpdateProfile}
                  showCompletionIndicators={showCompletionIndicators}
                />
              </div>
              
              <LanguagesSection 
                languages={profile?.languages || []} 
                onUpdate={handleUpdateProfile} 
              />
              
              <ProjectSection 
                projects={profile?.projects || []} 
                onUpdate={handleUpdateProfile} 
              />

              <CertificationsSection 
                certifications={profile?.certifications || []} 
                onUpdate={handleUpdateProfile} 
              />
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Progress */}
              <ProfileProgress
                profile={profile}
                onSectionClick={handleSectionClick}
              />
              
              {/* LinkedIn Import */}
              <ImportSection onImport={handleImportProfile} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
