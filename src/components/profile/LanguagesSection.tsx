import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Language } from '../../types/profile';
import { LanguageLevel } from '../../types/common';
import { toast } from 'react-hot-toast';

interface LanguagesSectionProps {
  languages: Language[];
  onUpdate: (data: { languages: Language[] }) => Promise<void>;
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({ languages, onUpdate }) => {
  const [newLanguage, setNewLanguage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LanguageLevel>('Intermediate');
  const [loading, setLoading] = useState(false);

  const handleAddLanguage = async () => {
    if (!newLanguage.trim()) return;

    // Check for duplicates
    if (languages.some(lang => lang.name.toLowerCase() === newLanguage.trim().toLowerCase())) {
      toast.error('This language is already added');
      return;
    }

    setLoading(true);
    try {
      await onUpdate({
        languages: [...languages, {
          id: crypto.randomUUID(),
          name: newLanguage.trim(),
          level: selectedLevel
        }]
      });
      setNewLanguage('');
      toast.success('Language added successfully');
    } catch (error) {
      toast.error('Failed to add language');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLanguage = async (id: string) => {
    setLoading(true);
    try {
      await onUpdate({
        languages: languages.filter(lang => lang.id !== id)
      });
      toast.success('Language removed successfully');
    } catch (error) {
      toast.error('Failed to remove language');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Languages</h2>

      <div className="flex gap-4">
        <input
          type="text"
          value={newLanguage}
          onChange={(e) => setNewLanguage(e.target.value)}
          className="flex-1 bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-300 dark:border-gray-700 transition-colors duration-300"
          placeholder="Add a language..."
          disabled={loading}
        />
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value as LanguageLevel)}
          className="bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-300 dark:border-gray-700 transition-colors duration-300"
          disabled={loading}
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
          <option value="Native">Native</option>
        </select>
        <button
          onClick={handleAddLanguage}
          disabled={loading || !newLanguage.trim()}
          className="bg-primary text-dark px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {languages.map(language => (
          <div
            key={language.id}
            className="flex items-center gap-2 bg-gray-100 dark:bg-dark-light text-gray-900 dark:text-white px-3 py-1 rounded-full transition-colors duration-300"
          >
            <span>{language.name}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">({language.level})</span>
            <button
              onClick={() => handleRemoveLanguage(language.id)}
              disabled={loading}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors duration-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
