import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Education } from '../../../types/profile';
import { EducationForm } from '../forms/EducationForm';

interface EducationCardProps {
  education: Education;
  onUpdate: (id: string, data: Partial<Education>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const EducationCard: React.FC<EducationCardProps> = ({
  education,
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
      <EducationForm
        education={education}
        onSubmit={async (data) => {
          await onUpdate(education.id, data);
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">{education.institution}</h3>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{education.degree} in {education.field}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
            {formatDate(education.start_date)} - {education.end_date ? formatDate(education.end_date) : 'Present'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-white"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(education.id)}
            className="text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {education.description && (
        <p className="text-gray-400 text-sm">{education.description}</p>
      )}
    </div>
  );
};
