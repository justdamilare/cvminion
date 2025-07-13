import React from 'react';
import { CheckCircle, Circle, TrendingUp, Award, Target } from 'lucide-react';
import { Profile } from '../../types/profile';

interface ProfileSection {
  name: string;
  isComplete: boolean;
  weight: number;
  description: string;
  action?: () => void;
}

interface ProfileProgressProps {
  profile: Profile | null;
  onSectionClick?: (section: string) => void;
}

export const ProfileProgress: React.FC<ProfileProgressProps> = ({ 
  profile, 
  onSectionClick 
}) => {
  const calculateProfileCompleteness = (): { sections: ProfileSection[], percentage: number } => {
    if (!profile) {
      return { 
        sections: [], 
        percentage: 0 
      };
    }

    const sections: ProfileSection[] = [
      {
        name: 'Personal Information',
        isComplete: !!(profile.full_name && profile.email && profile.phone_number && profile.address),
        weight: 15,
        description: 'Basic contact details and profile information'
      },
      {
        name: 'Professional Title',
        isComplete: !!(profile.title && profile.title.length > 3),
        weight: 10,
        description: 'Your current role or professional title'
      },
      {
        name: 'Professional Summary',
        isComplete: !!(profile.summary && profile.summary.length > 50),
        weight: 20,
        description: 'A compelling summary of your professional background'
      },
      {
        name: 'Work Experience',
        isComplete: profile.experience.length >= 1,
        weight: 25,
        description: 'At least one work experience entry'
      },
      {
        name: 'Education',
        isComplete: profile.education.length >= 1,
        weight: 15,
        description: 'Educational background and qualifications'
      },
      {
        name: 'Skills',
        isComplete: profile.skills.length >= 3,
        weight: 10,
        description: 'At least 3 relevant skills'
      },
      {
        name: 'Additional Sections',
        isComplete: (profile.languages.length + profile.projects.length + profile.certifications.length) >= 2,
        weight: 5,
        description: 'Languages, projects, or certifications'
      }
    ];

    const completedWeight = sections
      .filter(section => section.isComplete)
      .reduce((sum, section) => sum + section.weight, 0);

    const totalWeight = sections.reduce((sum, section) => sum + section.weight, 0);
    const percentage = Math.round((completedWeight / totalWeight) * 100);

    return { sections, percentage };
  };

  const { sections, percentage } = calculateProfileCompleteness();

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-green-600';
    if (percentage >= 60) return 'from-yellow-500 to-yellow-600';
    if (percentage >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getProgressMessage = (percentage: number) => {
    if (percentage >= 90) return 'Excellent! Your profile is comprehensive';
    if (percentage >= 80) return 'Great! Your profile looks strong';
    if (percentage >= 60) return 'Good progress! A few more sections to go';
    if (percentage >= 40) return 'Keep going! You\'re making good progress';
    return 'Let\'s build your professional profile';
  };

  const getBadgeLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'Expert', icon: Award, color: 'text-green-400' };
    if (percentage >= 80) return { level: 'Advanced', icon: TrendingUp, color: 'text-blue-400' };
    if (percentage >= 60) return { level: 'Intermediate', icon: Target, color: 'text-yellow-400' };
    return { level: 'Beginner', icon: Circle, color: 'text-gray-400' };
  };

  const badge = getBadgeLevel(percentage);
  const BadgeIcon = badge.icon;

  return (
    <div className="bg-dark-light rounded-xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Profile Strength</h3>
          <p className="text-gray-400 text-sm">{getProgressMessage(percentage)}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 ${badge.color}`}>
          <BadgeIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{badge.level}</span>
        </div>
      </div>

      {/* Progress Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          {/* Background circle */}
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-700"
            />
            {/* Progress circle */}
            <path
              d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${percentage}, 100`}
              className={`bg-gradient-to-r ${getProgressColor(percentage)} text-transparent bg-clip-text transition-all duration-1000 ease-out`}
              style={{
                background: `linear-gradient(to right, ${getProgressColor(percentage).replace('from-', '').replace(' to-', ', ')})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            />
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{percentage}%</div>
              <div className="text-xs text-gray-400">Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Profile Completion</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(percentage)} transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Section Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Section Status</h4>
        {sections.map((section, index) => (
          <div 
            key={section.name}
            className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
              section.isComplete 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800 cursor-pointer'
            }`}
            onClick={() => !section.isComplete && onSectionClick?.(section.name.toLowerCase().replace(' ', '_'))}
          >
            <div className="flex items-center gap-3">
              {section.isComplete ? (
                <CheckCircle className="w-5 h-5 text-green-400 animate-pulse" />
              ) : (
                <Circle className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <div className={`text-sm font-medium ${section.isComplete ? 'text-green-300' : 'text-white'}`}>
                  {section.name}
                </div>
                <div className="text-xs text-gray-400">{section.description}</div>
              </div>
            </div>
            <div className={`text-xs px-2 py-1 rounded ${
              section.isComplete 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-gray-700 text-gray-400'
            }`}>
              {section.weight}%
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      {percentage < 100 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary-dark/10 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <div className="text-sm font-medium text-white">
                {percentage < 50 ? 'Complete your basic profile' : 'Add finishing touches'}
              </div>
              <div className="text-xs text-gray-400">
                {100 - percentage}% remaining to reach 100% completion
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};