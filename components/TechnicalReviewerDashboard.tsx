
import React, { useMemo, useState } from 'react';
import { Audit, Auditor, ClientStatus, UserRole, Workflow } from '../types';
import { CLIENT_STATUS_CONFIG } from '../constants';
import ClientManager from './ClientManager';
import AuditRecordsManager from './AuditRecordsManager';
import { ActionManager } from './ActionManager';

// Inlined Icons
const FileSearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l-2.293-2.293a1 1 0 010-1.414l7-7a1 1 0 011.414 0l7 7a1 1 0 010 1.414L17 21m-7-3a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const BigCheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LayoutGridIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const ArchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;


interface TechnicalReviewerDashboardProps {
  audits: Audit[];
  auditors: Auditor[];
  setAuditors: (auditors: Auditor[] | ((val: Auditor[]) => Auditor[])) => void;
  workflows: Workflow[];
  onSelectAudit: (auditId: string) => void;
  onCreateAudit: (audit: Audit) => void;
  onUpdateAudit: (audit: Audit) => void;
  onDeleteAudit: (auditId: string) => void;
  userRole: UserRole;
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const TechnicalReviewerDashboard: React.FC<TechnicalReviewerDashboardProps> = (props) => {
  const { audits, onSelectAudit, auditors, setAuditors, onUpdateAudit } = props;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'completed_reviews' | 'clients' | 'audit_records' | 'actions' | 'settings'>('dashboard');

  // User/Profile State
  const currentUser = auditors[0];
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profileSignature, setProfileSignature] = useState(currentUser?.signature || '');

  const pendingReviewAudits = useMemo(() => {
    return audits
      .filter(audit => audit.status === ClientStatus.PendingTechnicalReview)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [audits]);

  const completedReviewAudits = useMemo(() => {
    return audits
      .filter(audit => [
          ClientStatus.Valid,
          ClientStatus.ActionRequired,
          ClientStatus.CorrectiveActionPendingReview,
          ClientStatus.CorrectiveActionApproved,
          ClientStatus.Suspended,
          ClientStatus.Revoked,
          ClientStatus.Withdrawn
      ].includes(audit.status))
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [audits]);

  const pendingActionCount = useMemo(() => {
      let count = 0;
      audits.forEach(audit => {
          (audit.actionItems || []).forEach(action => {
              if (action.senderRole === 'Technical Reviewer' && action.status === 'In Review') {
                  count++;
              }
          });
      });
      return count;
  }, [audits]);

  const handleDownloadReport = (audit: Audit) => {
    if (audit.certificationDecisionReport) {
        const link = document.createElement('a');
        link.href = audit.certificationDecisionReport;
        link.download = `Certification-Decision-${audit.clientName.replace(/ /g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert('Report is not available for download.');
    }
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
      { id: 'dashboard', title: 'Pending Reviews', icon: <LayoutGridIcon /> },
      { id: 'completed_reviews', title: 'Completed Reviews', icon: <CheckCircleIcon /> },
      { id: 'clients', title: 'Clients', icon: <UsersIcon /> },
      { id: 'audit_records', title: 'Audit Records', icon: <ArchiveIcon /> },
      { id: 'actions', title: 'Admin Request', icon: <ClipboardListIcon /> },
      { id: 'settings', title: 'Settings', icon: <SettingsIcon /> },
  ];

  const renderMainContent = () => {
      if (activeTab === 'dashboard') {
          return (
            <div>
                <h3 className="text-2xl font-bold text-text-primary mb-6">Audits Pending Review ({pendingReviewAudits.length})</h3>
                {pendingReviewAudits.length > 0 ? (
                  <div className="space-y-4">
                    {pendingReviewAudits.map(audit => (
                      <div key={audit.id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors bg-white shadow-sm">
                        <div>
                          <p className="font-semibold text-brand-primary text-lg">{audit.clientName}</p>
                          <p className="text-sm text-text-secondary">{audit.standardId} - {audit.currentStage}</p>
                          <p className="text-xs text-gray-500 mt-1">Submitted for review. Due: {formatDate(audit.dueDate)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${CLIENT_STATUS_CONFIG[audit.status]?.colors || ''}`}>
                                {CLIENT_STATUS_CONFIG[audit.status]?.label}
                            </span>
                          <button
                            onClick={() => onSelectAudit(audit.id)}
                            className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-brand-accent transition-colors"
                          >
                            Review Audit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border">
                    <FileSearchIcon />
                    <p className="mt-4 text-lg font-semibold text-text-secondary">No audits are currently pending technical review.</p>
                    <p className="text-gray-500 mt-1">Completed audits from auditors will appear here.</p>
                  </div>
                )}
            </div>
          );
      }
      if (activeTab === 'completed_reviews') {
          return (
             <div>
                <h3 className="text-2xl font-bold text-text-primary mb-6">Completed Technical Reviews</h3>
                 {completedReviewAudits.length > 0 ? (
                  <div className="space-y-4">
                    {completedReviewAudits.map(audit => (
                      <div key={audit.id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors bg-white shadow-sm">
                        <div>
                          <p className="font-semibold text-text-primary text-lg">{audit.clientName}</p>
                          <p className="text-sm text-text-secondary">{audit.standardId} - {audit.currentStage}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${CLIENT_STATUS_CONFIG[audit.status]?.colors || ''}`}>
                                {CLIENT_STATUS_CONFIG[audit.status]?.label}
                            </span>
                          {audit.certificationDecisionReport && (
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadReport(audit);
                              }}
                              className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                            >
                              Download Report
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border">
                    <BigCheckCircleIcon />
                    <p className="mt-4 text-lg font-semibold text-text-secondary">No reviews have been completed yet.</p>
                    <p className="text-gray-500 mt-1">Audits will appear here after you have made a certification decision.</p>
                  </div>
                )}
             </div>
          );
      }
      if (activeTab === 'clients') {
          return <ClientManager {...props} />;
      }
      if (activeTab === 'audit_records') {
          return <AuditRecordsManager audits={props.audits} onUpdateAudit={props.onUpdateAudit} />;
      }
      if (activeTab === 'actions') {
          return (
              <ActionManager 
                  audits={audits} 
                  onUpdateAudit={onUpdateAudit} 
                  currentUser={currentUser} 
                  userRole="technical_reviewer" 
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
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
                    Cert Decision Maker
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
    </div>
  );
};

export default TechnicalReviewerDashboard;
