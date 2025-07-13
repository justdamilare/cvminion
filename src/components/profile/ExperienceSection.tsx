import React, { useState } from 'react';
import { Plus, Briefcase, TrendingUp, Check, AlertCircle, GripVertical } from 'lucide-react';
import { Experience } from '../../types/profile';
import { ExperienceForm } from './forms/ExperienceForm';
import { ExperienceCard } from './cards/ExperienceCard';

interface ExperienceSectionProps {
  experience: Experience[];
  onUpdate: (data: { experience: Experience[] }) => Promise<void>;
  showCompletionIndicators?: boolean;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ 
  experience, 
  onUpdate,
  showCompletionIndicators = false
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Calculate completion stats
  const getCompletionStats = () => {
    const hasMinimumExperience = experience.length >= 1;
    const hasDetailedExperience = experience.some(exp => 
      exp.company_description && exp.company_description.length > 20 &&
      exp.highlights && exp.highlights.length > 0
    );
    
    let score = 0;
    if (hasMinimumExperience) score += 50;
    if (hasDetailedExperience) score += 30;
    if (experience.length >= 2) score += 20;
    
    return {
      score: Math.min(score, 100),
      hasMinimum: hasMinimumExperience,
      hasDetailed: hasDetailedExperience,
      recommendations: getRecommendations()
    };
  };

  const getRecommendations = () => {
    const recommendations = [];
    if (experience.length === 0) {
      recommendations.push('Add your first work experience');
    } else if (experience.length === 1) {
      recommendations.push('Add more work experiences to strengthen your profile');
    }
    
    const incompleteExperiences = experience.filter(exp => 
      !exp.company_description || exp.company_description.length < 20 ||
      !exp.highlights || exp.highlights.length === 0
    );
    
    if (incompleteExperiences.length > 0) {
      recommendations.push('Add descriptions and highlights to your experiences');
    }
    
    return recommendations;
  };

  const completionStats = getCompletionStats();

  // Handle drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    const reorderedExperience = [...experience];
    const [draggedItem] = reorderedExperience.splice(draggedIndex, 1);
    reorderedExperience.splice(targetIndex, 0, draggedItem);

    await onUpdate({ experience: reorderedExperience });
    setDraggedIndex(null);
  };

  const handleAdd = async (newExp: Omit<Experience, 'id'>) => {
    await onUpdate({
      experience: [...experience, { ...newExp, id: crypto.randomUUID() }]
    });
    setIsAdding(false);
  };

  const handleUpdate = async (id: string, data: Partial<Experience>) => {
    await onUpdate({
      experience: experience.map(exp => 
        exp.id === id ? { ...exp, ...data } : exp
      )
    });
  };

  const handleDelete = async (id: string) => {
    await onUpdate({
      experience: experience.filter(exp => exp.id !== id)
    });
  };

  return (
    <div className="bg-gradient-to-br from-dark-light to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
      {/* Completion Status Header */}
      {showCompletionIndicators && (
        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-4 mb-6">
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
                  <Briefcase className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  Work Experience
                </div>
                <div className="text-xs text-gray-400">
                  {experience.length} {experience.length === 1 ? 'experience' : 'experiences'} added
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-400">
                {completionStats.score}%
              </div>
              <div className="text-xs text-gray-400">Quality Score</div>
            </div>
          </div>
          
          {/* Recommendations */}
          {completionStats.recommendations.length > 0 && (
            <div className="mt-3 space-y-1">
              {completionStats.recommendations.map((rec, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-blue-300">
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
            <Briefcase className="w-5 h-5 text-dark" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Work Experience</h2>
            <p className="text-gray-400 text-sm">Showcase your professional journey</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-primary text-dark font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      {/* Experience List */}
      <div className="space-y-4">
        {experience.length === 0 && !isAdding ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-lg">
            <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No work experience added yet</h3>
            <p className="text-gray-400 mb-4">Start building your professional profile by adding your work experience</p>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-primary text-dark font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Add Your First Experience
            </button>
          </div>
        ) : (
          experience.map((exp, index) => (
            <div
              key={exp.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={`group relative transition-all duration-200 ${
                draggedIndex === index ? 'opacity-50 scale-95' : ''
              }`}
            >
              {/* Drag handle */}
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4 text-gray-500" />
              </div>
              
              <div className="ml-6">
                <ExperienceCard
                  experience={exp}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
          <ExperienceForm
            onSubmit={handleAdd}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      )}

      {/* Success State */}
      {experience.length > 0 && completionStats.score >= 80 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-green-300">
                Excellent work experience section!
              </div>
              <div className="text-xs text-gray-400">
                Your experience shows strong career progression and detailed accomplishments.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};