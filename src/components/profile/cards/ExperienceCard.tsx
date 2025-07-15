import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Experience } from '../../../types/profile';
import { ExperienceForm } from '../forms/ExperienceForm';

interface ExperienceCardProps {
  experience: Experience;
  onUpdate: (id: string, data: Partial<Experience>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  if (isEditing) {
    return (
      <ExperienceForm
        experience={experience}
        onSubmit={async (data) => {
          await onUpdate(experience.id, data);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-dark-light p-6 rounded-lg transition-colors duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">{experience.position}</h3>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{experience.company}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
            {formatDate(experience.start_date)} - {experience.end_date ? formatDate(experience.end_date) : 'Present'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(experience.id)}
            className="text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-300"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 transition-colors duration-300">{experience.description}</p>
      
      {experience.highlights.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-2 transition-colors duration-300">Key Achievements</h4>
          <ul className="list-disc list-inside space-y-1">
            {experience.highlights.map((highlight, index) => (
              <li key={index} className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};