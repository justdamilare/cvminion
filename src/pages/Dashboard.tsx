import React from 'react';
import { toast } from 'react-hot-toast';
import { Grid3X3, List, User, Zap, TrendingUp } from 'lucide-react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { ApplicationCard } from '../components/dashboard/ApplicationCard';
import { ApplicationModal, ApplicationFormData } from '../components/applications/ApplicationModal';
import { ApplicationDetails } from '../components/applications/ApplicationDetails';
import { FadeIn } from '../components/ui/FadeIn';
import { getApplications, createApplication, updateApplication } from '../lib/applications';
import { Application } from '../types/application';
import { getSupabaseClient } from '../lib/supabase';
import { useProfile } from '../hooks/useProfile';
import { useNavigate } from 'react-router-dom';

type ViewMode = 'cards' | 'list';

export const Dashboard = () => {
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  
  const { profile, completionPercentage } = useProfile();
  const navigate = useNavigate();

  React.useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const apps = await getApplications(user.id);
      setApplications(apps);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewApplication = async (data: ApplicationFormData) => {
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await createApplication(user.id, data);
      await loadApplications();
      toast.success('Application created successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateApplication = async (id: string, data: Partial<Application>) => {
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updated = await updateApplication(user.id, id, data);
      
      // Update both the applications list and the selected application
      setApplications(apps => apps.map(app => app.id === id ? updated : app));
      setSelectedApplication(current => current?.id === id ? updated : current);
      
      toast.success('Application updated successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-dark p-6 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <DashboardHeader onNewApplication={() => setIsModalOpen(true)} />
        
        {/* Profile Completion Widget */}
        {completionPercentage < 100 && (
          <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 border border-primary/20 rounded-xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Profile Completion</h3>
                  <p className="text-gray-300 text-sm">
                    Your profile is {completionPercentage}% complete. 
                    {completionPercentage < 60 ? ' Complete it to improve your resume quality!' : ' Almost there!'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-24 sm:w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400">{completionPercentage}%</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  View Profile
                </button>
                <button
                  onClick={() => navigate('/profile/wizard')}
                  className="px-4 py-2 bg-primary text-dark font-semibold rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Quick Setup
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* View Toggle */}
        <div className="flex justify-end">
          <div className="inline-flex rounded-lg border border-gray-600 bg-gray-800 p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </button>
          </div>
        </div>

        {/* Applications Display */}
        {console.log('Applications:', applications, 'ViewMode:', viewMode)}
        {viewMode === 'cards' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((application, index) => (
              <FadeIn key={application.id} delay={index * 0.1}>
                <ApplicationCard
                  application={application}
                  onView={() => setSelectedApplication(application)}
                />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-700 border-b border-gray-600 text-sm font-medium text-gray-300">
              <div className="col-span-3">Position</div>
              <div className="col-span-2">Company</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">ATS Score</div>
              <div className="col-span-2">Applied Date</div>
              <div className="col-span-1">Actions</div>
            </div>
            {applications.map((application, index) => (
              <div
                key={application.id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-700 cursor-pointer transition-colors hover:bg-gray-750 ${
                  index === applications.length - 1 ? 'border-b-0' : ''
                }`}
                onClick={() => setSelectedApplication(application)}
              >
                <div className="col-span-3 flex items-center">
                  <span className="font-medium text-white">{application.position}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-gray-300">{application.company}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    application.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                    application.status === 'interview' ? 'bg-green-100 text-green-800' :
                    application.status === 'offer' ? 'bg-purple-100 text-purple-800' :
                    application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
                <div className="col-span-2 flex items-center">
                  {application.atsScore ? (
                    <span className="text-primary font-medium">{application.atsScore}%</span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-gray-400">
                    {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="col-span-1 flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedApplication(application);
                    }}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <ApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleNewApplication}
        />

        {selectedApplication && (
          <ApplicationDetails
            application={selectedApplication}
            isOpen={true}
            onClose={() => setSelectedApplication(null)}
            onUpdate={handleUpdateApplication}
          />
        )}
      </div>
    </div>
  );
};
