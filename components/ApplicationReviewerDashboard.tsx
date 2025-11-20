
import React, { useState, useMemo } from 'react';
import { ApplicationReview, Auditor, Audit } from '../types';
// FIX: Module './ApplicationApprovalForm' has no default export. Changed to named import.
import { ApplicationApprovalForm } from './ApplicationApprovalForm';
import { ActionManager } from './ActionManager';

// Inlined Icons
const LayoutGridIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;


interface ApplicationReviewerDashboardProps {
    auditors: Auditor[];
    setAuditors: (auditors: Auditor[] | ((val: Auditor[]) => Auditor[])) => void;
    audits: Audit[];
    onUpdateAudit: (audit: Audit) => void;
}

const ApplicationReviewerDashboard: React.FC<ApplicationReviewerDashboardProps> = ({ auditors, setAuditors, audits, onUpdateAudit }) => {
  const [activeTab, setActiveTab] = useState<'application_review' | 'quotations' | 'actions' | 'settings'>('application_review');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [reviews, setReviews] = useState<ApplicationReview[]>([]);
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);

  // User/Profile State
  const currentUser = auditors[0];
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profileSignature, setProfileSignature] = useState(currentUser?.signature || '');

  const pendingActionCount = useMemo(() => {
      let count = 0;
      audits.forEach(audit => {
          (audit.actionItems || []).forEach(action => {
              if (action.senderRole === 'Application Reviewer' && action.status === 'In Review') {
                  count++;
              }
          });
      });
      return count;
  }, [audits]);

  const handleSaveReview = (review: ApplicationReview) => {
    setReviews(prev => [...prev, review]);
    setIsFormOpen(false);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleSaveSettings = () => {
      const updatedAuditors = [...auditors];
      if (updatedAuditors.length > 0) {
          updatedAuditors[0] = {
              ...updatedAuditors[0],
              name: profileName,
              email: profileEmail,
              signature: profileSignature
          };
          setAuditors(updatedAuditors);
          alert('Profile updated successfully.');
      }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setProfileSignature(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const sections = [
      { id: 'application_review', title: 'Application Review', icon: <LayoutGridIcon /> },
      { id: 'quotations', title: 'Quotations', icon: <FileTextIcon /> },
      { id: 'actions', title: 'Admin Request', icon: <ClipboardListIcon /> },
      { id: 'settings', title: 'Settings', icon: <SettingsIcon /> },
  ];

  const renderMainContent = () => {
      if (activeTab === 'application_review') {
          return (
            <div>
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-text-primary">Manage Application Reviews</h3>
                  <button
                      className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-brand-accent transition-colors"
                      onClick={() => setIsFormOpen(true)}
                  >
                      + New Application Review
                  </button>
              </div>
              {reviews.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg mt-4 border border-dashed">
                      <LayoutGridIcon />
                      <h4 className="mt-4 text-lg font-semibold text-text-secondary">No Application Reviews Found</h4>
                      <p className="mt-1 text-gray-500">Click "New Application Review" to get started.</p>
                  </div>
              ) : (
                  <div className="mt-4 space-y-3">
                      {reviews.map(review => (
                          <div key={review.id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50 bg-white shadow-sm">
                              <div>
                                  <p className="font-semibold text-brand-primary">{review.companyName}</p>
                                  <p className="text-sm text-text-secondary">Reviewed on: {new Date(review.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${review.decision === 'Application Approved' ? 'bg-green-100 text-green-800' : review.decision === 'Application Declined' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                      {review.decision || 'Pending'}
                                  </span>
                                  {review.pdfDataUri && (
                                       <button onClick={() => setViewingPdf(review.pdfDataUri)} className="bg-blue-600 text-white font-semibold py-1 px-3 rounded-lg text-sm hover:bg-blue-700">View PDF</button>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              )}
            </div>
          );
      }
      if (activeTab === 'quotations') {
          return (
            <div>
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-text-primary">Manage Quotations</h3>
                  <button
                      className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-brand-accent transition-colors"
                      onClick={() => alert('New Quotation form would open here.')}
                  >
                      + New Quotation
                  </button>
              </div>
              <div className="text-center py-16 bg-gray-50 rounded-lg mt-4 border border-dashed">
                  <FileTextIcon />
                  <h4 className="mt-4 text-lg font-semibold text-text-secondary">No Quotations Found</h4>
                  <p className="mt-1 text-gray-500">Click "New Quotation" to create one.</p>
              </div>
            </div>
          );
      }
      if (activeTab === 'actions') {
          return (
              <ActionManager 
                  audits={audits} 
                  onUpdateAudit={onUpdateAudit} 
                  currentUser={auditors[0]} 
                  userRole="application_reviewer" 
              />
          );
      }
      if (activeTab === 'settings') {
          return (
              <div className="max-w-2xl">
                  <h3 className="text-2xl font-bold text-text-primary mb-6">My Profile Settings</h3>
                  <div className="bg-white p-6 rounded-lg shadow-md border">
                      <div className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                              <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                              <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-text-secondary mb-2">Digital Signature</label>
                              <div className="p-4 border rounded-lg bg-gray-50 flex flex-col items-center">
                                  {profileSignature ? (
                                      <img src={profileSignature} alt="Signature" className="h-20 object-contain mb-4" />
                                  ) : (
                                      <p className="text-sm text-gray-500 mb-4">No signature uploaded.</p>
                                  )}
                                  <label className="cursor-pointer bg-white border border-gray-300 text-text-primary font-semibold py-2 px-4 rounded-md hover:bg-gray-50 transition-colors">
                                      Upload New Signature
                                      <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                                  </label>
                              </div>
                          </div>
                      </div>
                      <div className="mt-6 flex justify-end">
                          <button onClick={handleSaveSettings} className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-accent transition-colors">
                              Save Changes
                          </button>
                      </div>
                  </div>
              </div>
          );
      }
      return null;
  }

  return (
    <div>
      {/* Profile Card */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row items-center gap-6">
            {currentUser && currentUser.photo ? (
                <img src={currentUser.photo} alt="Profile" className="h-24 w-24 rounded-full object-cover border-4 border-brand-secondary shadow-sm" />
            ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-3xl border-4 border-brand-secondary shadow-sm">
                    {currentUser?.name.charAt(0)}
                </div>
            )}
            <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-text-primary mb-2">{currentUser?.name}</h2>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded border border-green-200 uppercase tracking-wider">
                    App Reviewer
                </span>
            </div>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-8">
             {/* Sidebar */}
             <aside className="w-full md:w-64 bg-white p-4 rounded-lg shadow-md md:sticky md:top-8 flex-shrink-0">
                <nav>
                    <ul className="space-y-1">
                        {sections.map(section => {
                            const isActive = activeTab === section.id;
                            let statusIndicator = null;
                             if (section.id === 'actions' && pendingActionCount > 0) {
                                 statusIndicator = <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{pendingActionCount}</span>;
                            }
                            return (
                                <li key={section.id}>
                                    <button
                                        onClick={() => setActiveTab(section.id as any)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-md text-lg font-semibold transition-colors relative ${
                                            isActive 
                                            ? 'bg-brand-primary text-white shadow-sm' 
                                            : 'text-text-secondary hover:bg-blue-100 hover:text-text-primary'
                                        }`}
                                    >
                                        <span className="w-6 h-6">{section.icon}</span>
                                        <span>{section.title}</span>
                                        {statusIndicator}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>

            <main className="flex-1 w-full bg-white p-6 md:p-8 rounded-lg shadow-md min-h-[calc(100vh-200px)]">
                {renderMainContent()}
            </main>
        </div>

      <ApplicationApprovalForm 
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveReview}
        auditors={auditors}
      />

      {viewingPdf && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setViewingPdf(null)}>
              <div className="bg-white p-2 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-end pb-2">
                       <button onClick={() => setViewingPdf(null)} className="text-gray-500 hover:text-gray-800 text-3xl font-bold leading-none">&times;</button>
                  </div>
                  <div className="flex-grow">
                      <iframe src={viewingPdf} className="w-full h-full border-none" title="Application Review PDF"></iframe>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ApplicationReviewerDashboard;
