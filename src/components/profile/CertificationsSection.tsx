import { Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Certification } from "../../types/profile";


interface CertificationsSectionProps {
  certifications: Certification[];
  onUpdate: (data: { certifications: Certification[] }) => Promise<void>;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({ certifications, onUpdate }) => {
  const [newCertification, setNewCertification] = useState('');
  
  const handleAddCertification = async () => {
    if (!newCertification.trim()) return;

    // Check for duplicates
    if (certifications.some(certification => certification.name.toLowerCase() === newCertification.trim().toLowerCase())) {
      toast.error('This certification is already added');
      return;
    }

    try {
      await onUpdate({
        certifications: [...certifications, {
          id: crypto.randomUUID(),
          name: newCertification.trim(),
          organization: '',
        }]
      });
      setNewCertification('');
      toast.success('Certification added successfully');
    } catch (error: any) {
      toast.error('Failed to add certification: ' + error.message);
    }
  };

  const handleRemoveCertification = async (id: string) => {
    try {
      await onUpdate({
        certifications: certifications.filter(certification => certification.id !== id)
      });
      toast.success('Certification removed successfully');
    } catch (error: any) {
        toast.error('Failed to remove certification: ' + error.message);
    }
  };

  return (
    <div className="space-y-4">

        <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Certifications</h2>
        <div className="flex gap-4">
       <input 
        type="text"
        value={newCertification}
        onChange={(e) => setNewCertification(e.target.value)}
        className="flex-1 bg-gray-50 dark:bg-dark text-gray-900 dark:text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none border border-gray-300 dark:border-gray-700 transition-colors duration-300"
        placeholder="Add a certification..."
      />
      <button
        onClick={handleAddCertification}
        disabled={!newCertification.trim()}
        className="bg-primary text-dark px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50"
      >
        <Plus className="w-5 h-5" />
      </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {certifications.map(certification => (
          <div
            key={certification.id}
            className="flex items-center gap-2 bg-gray-100 dark:bg-dark-light text-gray-900 dark:text-white px-3 py-1 rounded-full transition-colors duration-300"
          >
            <span>{certification.name}</span>
            <button
              onClick={() => handleRemoveCertification(certification.id)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

