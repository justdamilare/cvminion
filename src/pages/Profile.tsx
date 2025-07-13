import React from 'react';
import { toast } from 'react-hot-toast';
import { useProfile } from '../hooks/useProfile';
import { PersonalInfo } from '../components/profile/PersonalInfo';
import { ExperienceSection } from '../components/profile/ExperienceSection';
import { EducationSection } from '../components/profile/EducationSection';
import { SkillsSection } from '../components/profile/SkillsSection';
import { LanguagesSection } from '../components/profile/LanguagesSection';
import { ImportSection } from '../components/profile/ImportSection';
import { Profile } from '../types/profile';
import { ProjectSection } from '../components/profile/ProjectsSection';
import { CertificationsSection } from '../components/profile/CertificationsSection';

export const ProfilePage = () => {
  const { profile, loading, updating, updateProfile: updateProfileData, refreshProfile } = useProfile();

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

  if (loading) {
    return <div className="min-h-screen bg-dark p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <PersonalInfo 
              profile={profile} 
              onUpdate={handleUpdateProfile} 
            />
            <ExperienceSection 
              experience={profile?.experience || []} 
              onUpdate={handleUpdateProfile} 
            />
            <EducationSection 
              education={profile?.education || []} 
              onUpdate={handleUpdateProfile} 
            />
            <SkillsSection 
              skills={profile?.skills || []} 
              onUpdate={handleUpdateProfile} 
            />
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
          
          <div>
            <ImportSection onImport={handleImportProfile} />
          </div>
        </div>
      </div>
    </div>
  );
};
