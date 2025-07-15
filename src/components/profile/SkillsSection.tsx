import React, { useState } from 'react';
import { Plus, X, Star, Zap, TrendingUp, Check, AlertCircle, Lightbulb } from 'lucide-react';
import { Skill } from '../../types/profile';

interface SkillsSectionProps {
  skills: Skill[];
  onUpdate: (data: { skills: Skill[] }) => Promise<void>;
  showCompletionIndicators?: boolean;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ 
  skills, 
  onUpdate, 
  showCompletionIndicators = false 
}) => {
  const [newSkill, setNewSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<Skill['level']>('Intermediate');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Skill suggestions by category
  const skillSuggestions = {
    technical: ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Git', 'MongoDB'],
    soft: ['Leadership', 'Communication', 'Problem Solving', 'Project Management', 'Team Building', 'Critical Thinking', 'Adaptability', 'Time Management'],
    design: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Sketch', 'Prototyping', 'User Research', 'Wireframing', 'Design Systems'],
    business: ['Strategic Planning', 'Data Analysis', 'Market Research', 'Business Development', 'Financial Modeling', 'Agile', 'Scrum', 'Stakeholder Management']
  };

  // Calculate completion stats
  const getCompletionStats = () => {
    const minSkills = 3;
    const goodSkills = 5;
    const excellentSkills = 8;
    
    let score = 0;
    if (skills.length >= minSkills) score += 40;
    if (skills.length >= goodSkills) score += 30;
    if (skills.length >= excellentSkills) score += 30;
    
    // Bonus for skill level variety
    const uniqueLevels = new Set(skills.map(s => s.level)).size;
    if (uniqueLevels >= 2) score += Math.min(uniqueLevels * 5, 20);
    
    return {
      score: Math.min(score, 100),
      count: skills.length,
      recommendations: getRecommendations()
    };
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (skills.length < 3) {
      recommendations.push('Add at least 3 skills to strengthen your profile');
    } else if (skills.length < 5) {
      recommendations.push('Consider adding more skills to showcase your expertise');
    }
    
    const hasAdvancedSkills = skills.some(s => s.level === 'Advanced' || s.level === 'Expert');
    if (!hasAdvancedSkills && skills.length > 0) {
      recommendations.push('Highlight your advanced skills by updating skill levels');
    }
    
    return recommendations;
  };

  const completionStats = getCompletionStats();

  const getSkillLevelColor = (level: Skill['level']) => {
    switch (level) {
      case 'Expert': return 'from-purple-500 to-purple-600';
      case 'Advanced': return 'from-blue-500 to-blue-600';
      case 'Intermediate': return 'from-green-500 to-green-600';
      case 'Beginner': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getSkillLevelIcon = (level: Skill['level']) => {
    switch (level) {
      case 'Expert': return Star;
      case 'Advanced': return TrendingUp;
      case 'Intermediate': return Zap;
      case 'Beginner': return Plus;
      default: return Plus;
    }
  };

  const handleAddSkill = async (skillName?: string, level?: Skill['level']) => {
    const name = skillName || newSkill.trim();
    const skillLevel = level || selectedLevel;
    
    if (!name) return;

    // Check if skill already exists
    if (skills.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      return; // Don't add duplicate skills
    }

    await onUpdate({
      skills: [...skills, {
        id: crypto.randomUUID(),
        name,
        level: skillLevel
      }]
    });

    setNewSkill('');
    setShowSuggestions(false);
  };

  const handleRemoveSkill = async (id: string) => {
    await onUpdate({
      skills: skills.filter(skill => skill.id !== id)
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-light dark:to-gray-900 rounded-xl p-6 border border-gray-300 dark:border-gray-700 shadow-xl transition-colors duration-300">
      {/* Completion Status Header */}
      {showCompletionIndicators && (
        <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                completionStats.score >= 80 
                  ? 'bg-green-500 text-white' 
                  : completionStats.score >= 50
                  ? 'bg-yellow-500 text-dark'
                  : 'bg-red-500 text-white'
              }`}>
                {completionStats.score >= 80 ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                  Skills & Expertise
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  {completionStats.count} skills added
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-400">
                {completionStats.score}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">Strength Score</div>
            </div>
          </div>
          
          {completionStats.recommendations.length > 0 && (
            <div className="mt-3 space-y-1">
              {completionStats.recommendations.map((rec, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-purple-300">
                  <AlertCircle className="w-3 h-3" />
                  {rec}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-dark" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Skills & Expertise</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Showcase your technical and soft skills</p>
          </div>
        </div>
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
        >
          <Lightbulb className="w-4 h-4" />
          Suggestions
        </button>
      </div>

      {/* Add Skill Form */}
      <div className="mb-6">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
            className="flex-1 bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
            placeholder="Add a skill (e.g., JavaScript, Leadership, Design Thinking)"
          />
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as Skill['level'])}
            className="bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-300 dark:border-gray-700 min-w-[140px] transition-colors duration-300"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
          <button
            onClick={() => handleAddSkill()}
            disabled={!newSkill.trim()}
            className="bg-primary text-dark px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Skill Suggestions */}
        {showSuggestions && (
          <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4 space-y-4 animate-in slide-in-from-top-2 duration-300 transition-colors">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-300">💡 Skill Suggestions</h3>
            
            {Object.entries(skillSuggestions).map(([category, categorySkills]) => (
              <div key={category}>
                <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 transition-colors duration-300">
                  {category} Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {categorySkills
                    .filter(skill => !skills.some(s => s.name.toLowerCase() === skill.toLowerCase()))
                    .slice(0, 6)
                    .map(skill => (
                    <button
                      key={skill}
                      onClick={() => handleAddSkill(skill, 'Intermediate')}
                      className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skills Display */}
      <div className="space-y-4">
        {skills.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-300">
            <Zap className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4 transition-colors duration-300" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">No skills added yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">Add your skills to showcase your expertise to potential employers</p>
            <button
              onClick={() => setShowSuggestions(true)}
              className="bg-primary text-dark font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Browse Skill Suggestions
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Your Skills ({skills.length})</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Drag to reorder
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {skills.map((skill, index) => {
                const LevelIcon = getSkillLevelIcon(skill.level);
                return (
                  <div
                    key={skill.id}
                    className={`group relative bg-gradient-to-r ${getSkillLevelColor(skill.level)} p-[1px] rounded-lg hover:scale-105 transition-transform duration-200`}
                  >
                    <div className="bg-gray-50 dark:bg-dark-light rounded-lg p-3 h-full transition-colors duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <LevelIcon className="w-4 h-4 text-gray-900 dark:text-white transition-colors duration-300" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white text-sm transition-colors duration-300">{skill.name}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">{skill.level}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSkill(skill.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Success State */}
      {skills.length >= 5 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-green-300">
                Great skill diversity!
              </div>
              <div className="text-xs text-gray-400">
                You've showcased a strong range of skills that will appeal to employers.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};