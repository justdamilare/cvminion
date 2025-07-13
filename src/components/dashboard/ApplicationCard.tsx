import React from 'react';
import { FileText, Target, Calendar, MoreVertical } from 'lucide-react';

interface ApplicationCardProps {
  application: {
    id: string;
    company: string;
    position: string;
    status: string;
    atsScore?: number;
    appliedDate?: string;
  };
  onView: () => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onView }) => {
  return (
    <div 
      onClick={() => onView()}
      className="bg-dark-light p-6 rounded-lg cursor-pointer hover:bg-dark-light/80 transition-colors group h-48 flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white mb-1 truncate">{application.position}</h3>
          <p className="text-gray-400 truncate">{application.company}</p>
        </div>
        <button className="text-gray-400 hover:text-white p-1 flex-shrink-0">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 flex flex-col pb-4">
        <div className="flex items-center text-gray-400">
          <Target className="w-4 h-4 mr-2" />
          <span>ATS Score: </span>
          <span className="ml-1 text-primary font-medium">
            {application.atsScore ? `${application.atsScore}%` : 'N/A'}
          </span>
        </div>

        <div className="flex items-center text-gray-400">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'Not applied yet'}
          </span>
        </div>

        <div className="flex items-center text-gray-400">
          <FileText className="w-4 h-4 mr-2 text-primary" />
          <span>Status: </span>
          <span className={`ml-1 ${
            application.status === 'Applied' ? 'text-blue-400' :
            application.status === 'Interview' ? 'text-green-400' :
            application.status === 'Rejected' ? 'text-red-400' :
            'text-yellow-400'
          }`}>
            {application.status}
          </span>
        </div>
      </div>
    </div>
  );
};
