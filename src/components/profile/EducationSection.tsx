import React, { useState } from 'react';
import { Plus, GraduationCap, Check, AlertCircle, Award, BookOpen } from 'lucide-react';
import { Education } from '../../types/profile';
import { EducationForm } from './forms/EducationForm';
import { EducationCard } from './cards/EducationCard';

interface EducationSectionProps {
  education: Education[];
  onUpdate: (data: { education: Education[] }) => Promise<void>;
  showCompletionIndicators?: boolean;
}

export const EducationSection: React.FC<EducationSectionProps> = ({ 
  education, 
  onUpdate,
  showCompletionIndicators = false
}) => {
  const [isAdding, setIsAdding] = useState(false);

  // Calculate completion stats
  const getCompletionStats = () => {
    const hasEducation = education.length >= 1;
    const hasDetailedEducation = education.some(edu => 
      edu.description && edu.description.length > 20
    );
    const hasRecentEducation = education.some(edu => {
      if (!edu.end_date) return true; // Currently studying
      const endDate = new Date(edu.end_date);
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      return endDate > tenYearsAgo;
    });
    
    let score = 0;
    if (hasEducation) score += 60;
    if (hasDetailedEducation) score += 25;
    if (hasRecentEducation) score += 15;
    
    return {
      score: Math.min(score, 100),
      count: education.length,
      hasEducation,
      hasDetailedEducation,
      recommendations: getRecommendations()
    };
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (education.length === 0) {
      recommendations.push('Add your educational background');
    }
    
    const incompleteEducation = education.filter(edu => 
      !edu.description || edu.description.length < 20
    );
    
    if (incompleteEducation.length > 0) {
      recommendations.push('Add descriptions to your education entries');
    }
    
    if (education.length === 1) {
      recommendations.push('Consider adding additional education, certifications, or courses');
    }
    
    return recommendations;
  };

  const completionStats = getCompletionStats();

  // Get education type icon
  const getEducationIcon = (degree: string) => {
    const lowerDegree = degree.toLowerCase();
    if (lowerDegree.includes('phd') || lowerDegree.includes('doctorate')) {
      return Award;
    } else if (lowerDegree.includes('master') || lowerDegree.includes('mba')) {
      return GraduationCap;
    } else if (lowerDegree.includes('bachelor') || lowerDegree.includes('ba') || lowerDegree.includes('bs')) {
      return BookOpen;
    }
    return GraduationCap;
  };

  const handleAdd = async (newEdu: Omit<Education, 'id'>) => {
    await onUpdate({
      education: [...education, { ...newEdu, id: crypto.randomUUID() }]
    });
    setIsAdding(false);
  };

  const handleUpdate = async (id: string, data: Partial<Education>) => {
    await onUpdate({
      education: education.map(edu => 
        edu.id === id ? { ...edu, ...data } : edu
      )
    });
  };

  const handleDelete = async (id: string) => {
    await onUpdate({
      education: education.filter(edu => edu.id !== id)
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-light dark:to-gray-900 rounded-xl p-6 border border-gray-300 dark:border-gray-700 shadow-xl transition-colors duration-300">
      {/* Completion Status Header */}
      {showCompletionIndicators && (
        <div className="bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 border border-indigo-500/20 rounded-lg p-4 mb-6">
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
                  <GraduationCap className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                  Education
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  {completionStats.count} {completionStats.count === 1 ? 'entry' : 'entries'} added
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 transition-colors duration-300">
                {completionStats.score}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">Complete</div>
            </div>
          </div>
          
          {completionStats.recommendations.length > 0 && (
            <div className="mt-3 space-y-1">
              {completionStats.recommendations.map((rec, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-300 transition-colors duration-300">
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
            <GraduationCap className="w-5 h-5 text-dark" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Education</h2>
            <p className="text-gray-400 text-sm">Your academic background and qualifications</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-primary text-dark font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>

      {/* Education List */}
      <div className="space-y-4">
        {education.length === 0 && !isAdding ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-lg">
            <GraduationCap className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No education added yet</h3>
            <p className="text-gray-400 mb-4">Add your educational background to strengthen your professional profile</p>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-primary text-dark font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Add Your First Education
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {education.map((edu, index) => {
              const EducationIcon = getEducationIcon(edu.degree);
              return (
                <div
                  key={edu.id}
                  className="group relative"
                >
                  {/* Education type indicator */}
                  <div className="absolute left-2 top-4 w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <EducationIcon className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="ml-12">
                    <EducationCard
                      education={edu}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-white mb-2">📚 Education Tips:</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Include your highest degree first</li>
              <li>• Add relevant certifications and online courses</li>
              <li>• Mention honors, awards, or notable achievements</li>
              <li>• Include relevant coursework for entry-level positions</li>
            </ul>
          </div>
          
          <EducationForm
            onSubmit={handleAdd}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      )}

      {/* Success State */}
      {education.length > 0 && completionStats.score >= 80 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-green-300">
                Strong educational background!
              </div>
              <div className="text-xs text-gray-400">
                Your education section provides a solid foundation for your professional profile.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};