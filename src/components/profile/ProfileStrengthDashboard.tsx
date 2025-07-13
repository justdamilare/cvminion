import React from 'react';
import { TrendingUp, Star, Award, Target, Zap, Users, Eye, Briefcase } from 'lucide-react';
import { Profile } from '../../types/profile';

interface ProfileStrengthDashboardProps {
  profile: Profile | null;
  linkedinData?: Partial<Profile>;
  onImprove?: (recommendation: string) => void;
}

interface StrengthMetric {
  name: string;
  score: number;
  maxScore: number;
  description: string;
  improvement?: string;
  icon: React.ElementType;
}

interface Achievement {
  title: string;
  description: string;
  unlocked: boolean;
  icon: React.ElementType;
  color: string;
}

export const ProfileStrengthDashboard: React.FC<ProfileStrengthDashboardProps> = ({ 
  profile, 
  linkedinData,
  onImprove 
}) => {
  const calculateStrengthMetrics = (): StrengthMetric[] => {
    if (!profile) return [];

    return [
      {
        name: 'Content Quality',
        score: calculateContentScore(),
        maxScore: 100,
        description: 'Quality and completeness of your profile content',
        improvement: profile.summary.length < 100 ? 'Expand your professional summary' : undefined,
        icon: Star
      },
      {
        name: 'Professional Presence',
        score: calculatePresenceScore(),
        maxScore: 100,
        description: 'How well you present your professional brand',
        improvement: !profile.linkedin ? 'Add your LinkedIn profile' : undefined,
        icon: Briefcase
      },
      {
        name: 'Experience Depth',
        score: calculateExperienceScore(),
        maxScore: 100,
        description: 'Depth and relevance of your work experience',
        improvement: profile.experience.length < 2 ? 'Add more work experiences' : undefined,
        icon: TrendingUp
      },
      {
        name: 'Skills Showcase',
        score: calculateSkillsScore(),
        maxScore: 100,
        description: 'How well you showcase your technical and soft skills',
        improvement: profile.skills.length < 5 ? 'Add more relevant skills' : undefined,
        icon: Zap
      }
    ];
  };

  const calculateContentScore = (): number => {
    if (!profile) return 0;
    
    let score = 0;
    // Basic info (25 points)
    if (profile.full_name && profile.email && profile.phone_number) score += 25;
    // Summary quality (35 points)
    if (profile.summary.length > 50) score += 15;
    if (profile.summary.length > 150) score += 10;
    if (profile.summary.length > 300) score += 10;
    // Title (15 points)
    if (profile.title && profile.title.length > 3) score += 15;
    // Additional links (25 points)
    if (profile.linkedin) score += 10;
    if (profile.website) score += 8;
    if (profile.github) score += 7;
    
    return Math.min(score, 100);
  };

  const calculatePresenceScore = (): number => {
    if (!profile) return 0;
    
    let score = 0;
    // Professional title (20 points)
    if (profile.title) score += 20;
    // Complete contact info (30 points)
    if (profile.email && profile.phone_number && profile.address) score += 30;
    // Social links (30 points)
    if (profile.linkedin) score += 15;
    if (profile.website) score += 10;
    if (profile.github) score += 5;
    // Summary quality (20 points)
    if (profile.summary.length > 100) score += 20;
    
    return Math.min(score, 100);
  };

  const calculateExperienceScore = (): number => {
    if (!profile) return 0;
    
    let score = 0;
    const expCount = profile.experience.length;
    
    // Number of experiences (40 points)
    if (expCount >= 1) score += 20;
    if (expCount >= 2) score += 10;
    if (expCount >= 3) score += 10;
    
    // Experience detail quality (40 points)
    const detailedExperiences = profile.experience.filter(exp => 
      exp.company_description && exp.company_description.length > 20 &&
      exp.highlights && exp.highlights.length > 0
    );
    score += Math.min(detailedExperiences.length * 20, 40);
    
    // Recent experience (20 points)
    const hasRecentExp = profile.experience.some(exp => {
      if (!exp.end_date) return true; // Current position
      const endDate = new Date(exp.end_date);
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      return endDate > twoYearsAgo;
    });
    if (hasRecentExp) score += 20;
    
    return Math.min(score, 100);
  };

  const calculateSkillsScore = (): number => {
    if (!profile) return 0;
    
    let score = 0;
    const skillCount = profile.skills.length;
    
    // Number of skills (60 points)
    if (skillCount >= 3) score += 20;
    if (skillCount >= 5) score += 20;
    if (skillCount >= 8) score += 20;
    
    // Skill levels variety (20 points)
    const skillLevels = new Set(profile.skills.map(skill => skill.level));
    score += skillLevels.size * 5;
    
    // Additional sections (20 points)
    if (profile.languages.length > 0) score += 10;
    if (profile.certifications.length > 0) score += 10;
    
    return Math.min(score, 100);
  };

  const calculateOverallScore = (): number => {
    const metrics = calculateStrengthMetrics();
    if (metrics.length === 0) return 0;
    
    const totalScore = metrics.reduce((sum, metric) => sum + metric.score, 0);
    return Math.round(totalScore / metrics.length);
  };

  const getAchievements = (): Achievement[] => {
    if (!profile) return [];

    return [
      {
        title: 'Profile Pioneer',
        description: 'Created your first profile',
        unlocked: true,
        icon: Target,
        color: 'text-blue-400'
      },
      {
        title: 'Content Creator',
        description: 'Added a comprehensive professional summary',
        unlocked: profile.summary.length > 200,
        icon: Star,
        color: 'text-yellow-400'
      },
      {
        title: 'Experience Expert',
        description: 'Added 3+ work experiences',
        unlocked: profile.experience.length >= 3,
        icon: Briefcase,
        color: 'text-green-400'
      },
      {
        title: 'Skill Showcase',
        description: 'Listed 8+ skills',
        unlocked: profile.skills.length >= 8,
        icon: Zap,
        color: 'text-purple-400'
      },
      {
        title: 'Well Connected',
        description: 'Added LinkedIn and other social profiles',
        unlocked: !!(profile.linkedin && (profile.website || profile.github)),
        icon: Users,
        color: 'text-indigo-400'
      },
      {
        title: 'Profile Perfectionist',
        description: 'Achieved 90%+ profile completion',
        unlocked: calculateOverallScore() >= 90,
        icon: Award,
        color: 'text-primary'
      }
    ];
  };

  const metrics = calculateStrengthMetrics();
  const overallScore = calculateOverallScore();
  const achievements = getAchievements();
  const unlockedAchievements = achievements.filter(a => a.unlocked);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (profile?.summary.length < 150) {
      recommendations.push('Expand your professional summary to at least 150 characters');
    }
    if (profile?.experience.length < 2) {
      recommendations.push('Add more work experiences to strengthen your profile');
    }
    if (profile?.skills.length < 5) {
      recommendations.push('List more relevant skills to showcase your expertise');
    }
    if (!profile?.linkedin) {
      recommendations.push('Add your LinkedIn profile URL to increase credibility');
    }
    if (profile?.education.length === 0) {
      recommendations.push('Add your educational background');
    }
    
    return recommendations.slice(0, 3); // Show top 3 recommendations
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className="bg-gradient-to-br from-dark-light to-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Profile Strength</h2>
            <p className="text-gray-400">Overall profile quality assessment</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <div className="text-sm text-gray-400">out of 100</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
          <div 
            className="h-3 rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-1000 ease-out"
            style={{ width: `${overallScore}%` }}
          />
        </div>

        {/* Before/After comparison if LinkedIn data available */}
        {linkedinData && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">LinkedIn Import Impact</span>
            </div>
            <div className="text-sm text-gray-300">
              Your profile strength would increase by an estimated 15-25 points with LinkedIn data
            </div>
          </div>
        )}
      </div>

      {/* Strength Metrics */}
      <div className="grid md:grid-cols-2 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="bg-dark-light rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="font-medium text-white">{metric.name}</span>
                </div>
                <span className={`text-lg font-bold ${getScoreColor(metric.score)}`}>
                  {metric.score}
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500"
                  style={{ width: `${metric.score}%` }}
                />
              </div>
              
              <p className="text-xs text-gray-400 mb-2">{metric.description}</p>
              
              {metric.improvement && (
                <button
                  onClick={() => onImprove?.(metric.improvement!)}
                  className="text-xs text-primary hover:text-primary-dark transition-colors"
                >
                  💡 {metric.improvement}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Achievements */}
      <div className="bg-dark-light rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Achievements</h3>
          <div className="text-sm text-gray-400">
            {unlockedAchievements.length} of {achievements.length} unlocked
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div 
                key={achievement.title}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-primary/30' 
                    : 'bg-gray-800/50 border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${achievement.unlocked ? achievement.color : 'text-gray-500'}`} />
                  <span className={`text-xs font-medium ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                    {achievement.title}
                  </span>
                </div>
                <p className={`text-xs ${achievement.unlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                  {achievement.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-dark-light rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">Recommendations</h3>
        </div>
        
        <div className="space-y-3">
          {getRecommendations().map((recommendation, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
              onClick={() => onImprove?.(recommendation)}
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">{index + 1}</span>
              </div>
              <div>
                <p className="text-sm text-white">{recommendation}</p>
                <p className="text-xs text-gray-400 mt-1">Click to take action</p>
              </div>
            </div>
          ))}
          
          {getRecommendations().length === 0 && (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-white mb-2">Excellent Work!</h4>
              <p className="text-gray-400">Your profile looks great. Keep it updated with new experiences and skills.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};