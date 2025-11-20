
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Audit, AuditorStatus, Clause, Workflow, AuditorDocument, ClientStatus, Auditor } from '../types';
import ProgressBar from './ProgressBar';
import { CLIENT_STATUS_CONFIG } from '../constants';
import { ActionManager } from './ActionManager';


// Inlined SVGs for UI elements
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const Trash2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const LayoutGridIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>;
const UserCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>;

interface AuditorDashboardProps {
  audits: Audit[];
  auditors: Auditor[];
  setAuditors: (auditors: Auditor[] | ((val: Auditor[]) => Auditor[])) => void;
  onSelectAudit: (auditId: string) => void;
  onUpdateAudit: (updatedAudit: Audit) => void;
  workflows: Workflow[];
  getClausesForAudit: (audit: Audit) => Clause[];
}

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-3xl font-bold text-text-primary">{value}</p>
      <p className="text-sm text-text-secondary">{title}</p>
    </div>
  </div>
);

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

const AuditorDashboard: React.FC<AuditorDashboardProps> = ({ audits, auditors, setAuditors, onSelectAudit, onUpdateAudit, workflows, getClausesForAudit }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'corrective_actions' | 'actions' | 'settings'>('dashboard');
  const [viewingClientInfo, setViewingClientInfo] = useState<Audit | null>(null);

  const [reviewingAudit, setReviewingAudit] = useState<Audit | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'rejected' | null>(null);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [reviewNotes, setReviewNotes] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Settings State
  const [profileName, setProfileName] = useState(auditors[0]?.name || '');
  const [profileEmail, setProfileEmail] = useState(auditors[0]?.email || '');
  const [profileSignature, setProfileSignature] = useState(auditors[0]?.signature || '');
  
  const currentAuditor = auditors[0];

  const calculateProgress = (audit: Audit) => {
    const totalClauses = getClausesForAudit(audit).length;
    if (totalClauses === 0) return 0;
    
    const completedStatuses = [
      AuditorStatus.Accepted,
      AuditorStatus.MinorNC,
      AuditorStatus.MajorNC,
    ];
    const completedCount = audit.statuses.filter(s => completedStatuses.includes(s.auditorStatus)).length;
    return (completedCount / totalClauses) * 100;
  };
  
    const getLatestResubmissionDoc = (audit: Audit): AuditorDocument | null => {
    return [...(audit.auditorDocuments || [])]
        .filter(doc => doc.name.startsWith('Corrective_Action_Resubmission_'))
        .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())[0] || null;
  };

  const handleDownload = (audit: Audit) => {
    const doc = getLatestResubmissionDoc(audit);
    if (doc && doc.dataUrl) {
        const link = document.createElement('a');
        link.href = doc.dataUrl;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert('No evidence document from the client was found for this corrective action.');
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const upcoming = audits.filter(audit => {
        const dueDate = new Date(audit.dueDate);
        return dueDate > now && dueDate <= thirtyDaysFromNow;
    }).length;
    
    const overdue = audits.filter(audit => new Date(audit.dueDate) < now && calculateProgress(audit) < 100).length;

    const openNCs = audits.filter(audit => 
        audit.statuses.some(s => s.auditorStatus === AuditorStatus.MajorNC || s.auditorStatus === AuditorStatus.MinorNC)
    ).length;

    return {
        totalClients: audits.length,
        upcoming,
        overdue,
        openNCs
    };
  }, [audits, getClausesForAudit]);

  const correctiveActionsAudits = useMemo(() => {
    return audits.filter(audit => audit.status === ClientStatus.CorrectiveActionPendingReview);
  }, [audits]);
  
  const pendingActionCount = useMemo(() => {
      let count = 0;
      audits.forEach(audit => {
          (audit.actionItems || []).forEach(action => {
              if (action.senderName === currentAuditor.name && action.status === 'In Review') {
                  count++;
              }
          });
      });
      return count;
  }, [audits, currentAuditor.name]);

  const resetReviewModal = () => {
    setReviewingAudit(null);
    setApprovalStatus(null);
    setStagedFiles([]);
    setReviewNotes('');
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  }
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewNotes(e.target.value);
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scroll height
    }
  };
  
  const handleRemoveStagedFile = (fileIndex: number) => {
    setStagedFiles(prev => prev.filter((_, index) => index !== fileIndex));
  };

  const handleReviewSubmit = () => {
    if (!reviewingAudit || !approvalStatus) {
        alert("Please select 'Approve' or 'Reject'.");
        return;
    }

    const filesToProcess = [...stagedFiles];

    if (reviewNotes.trim()) {
        const notesBlob = new Blob([reviewNotes], { type: 'text/plain' });
        const notesFile = new File([notesBlob], 'Auditor_Review_Notes.txt', { type: 'text/plain' });
        filesToProcess.push(notesFile);
    }
    
    const processSubmit = (additionalDocuments: AuditorDocument[] = []) => {
        const newStatus = approvalStatus === 'approved' 
            ? ClientStatus.CorrectiveActionApproved 
            : ClientStatus.ActionRequired;

        const updatedDocuments = [...(reviewingAudit.auditorDocuments || []), ...additionalDocuments];

        const updatedAudit: Audit = {
            ...reviewingAudit,
            status: newStatus,
            auditorDocuments: updatedDocuments,
        };
        onUpdateAudit(updatedAudit);
        resetReviewModal();
    };

    if (filesToProcess.length > 0) {
        const newDocumentsPromises = filesToProcess.map(file => {
            return new Promise<AuditorDocument>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const prefix = approvalStatus === 'approved' ? 'Auditor_Approved_Evidence_' : 'Auditor_Rejection_Feedback_';
                    const isNotesFile = file.name === 'Auditor_Review_Notes.txt';
                    
                    resolve({
                        id: crypto.randomUUID(),
                        name: isNotesFile ? file.name : `${prefix}${file.name}`,
                        type: file.type,
                        size: file.size,
                        dataUrl: reader.result as string,
                        uploadDate: new Date().toISOString(),
                    });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newDocumentsPromises)
            .then(newDocuments => {
                processSubmit(newDocuments);
            })
            .catch(error => {
                console.error("Error processing files:", error);
                alert("There was an error processing the uploaded files.");
            });
    } else {
        processSubmit();
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
  
  const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-text-secondary">{label}</dt>
        <dd className="mt-1 text-base text-text-primary">{value || '-'}</dd>
    </div>
  );

  const sections = [
    { id: 'dashboard', title: 'Dashboard', icon: <LayoutGridIcon /> },
    { id: 'clients', title: 'Active Clients', icon: <UsersIcon /> },
    { id: 'corrective_actions', title: 'Corrective Actions', icon: <AlertCircleIcon /> },
    { id: 'actions', title: 'Admin Request', icon: <ClipboardListIcon /> },
    { id: 'settings', title: 'Settings', icon: <SettingsIcon /> },
  ];

  const renderMainContent = () => {
      if (activeTab === 'dashboard') {
          return (
            <>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Dashboard Overview</h2>
                <p className="text-text-secondary mb-8">
                    Welcome to your Auditor Dashboard. Here you can track your assigned audits, manage schedules, and review corrective actions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard title="Total Assigned Clients" value={stats.totalClients} icon={<UsersIcon />} color="bg-blue-100 text-blue-600" />
                    <StatCard title="Upcoming Audits (30 days)" value={stats.upcoming} icon={<CalendarIcon />} color="bg-yellow-100 text-yellow-600" />
                    <StatCard title="Overdue Audits" value={stats.overdue} icon={<AlertTriangleIcon />} color="bg-red-100 text-red-600" />
                    <StatCard title="Clients with Open NCs" value={stats.openNCs} icon={<AlertCircleIcon />} color="bg-orange-200 text-orange-800" />
                </div>
            </>
          )
      }
      if (activeTab === 'clients') {
          return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary mb-6">Active Clients</h2>
                {audits.map(audit => (
                    <div key={audit.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
                        <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="flex-grow mb-4 md:mb-0">
                                <h3 className="text-lg font-semibold text-brand-primary">{audit.clientName}</h3>
                                <p className="text-sm text-text-secondary">{audit.standardId} - {audit.currentStage}</p>
                                <p className="text-xs text-gray-500 mt-1">Due: {formatDate(audit.dueDate)}</p>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 bg-gray-50 w-fit px-2 py-1 rounded border border-gray-100">
                                    <UserCheckIcon />
                                    <span>Assigned Auditor: <span className="font-semibold">{audit.assignedAuditor}</span></span>
                                </div>
                            </div>
                            <div className="w-full md:w-1/4 mb-4 md:mb-0 md:mx-4">
                                <ProgressBar progress={calculateProgress(audit)} />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setViewingClientInfo(audit); }}
                                  className="bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                                >
                                  <InfoIcon /> Client Info
                                </button>
                                <button onClick={() => onSelectAudit(audit.id)} className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-brand-accent transition-colors">View Audit</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          )
      }
      if (activeTab === 'corrective_actions') {
          return (
            <div>
                <h3 className="text-2xl font-bold text-text-primary mb-6">Clients Pending Corrective Action Review</h3>
                <div className="space-y-4">
                    {correctiveActionsAudits.length > 0 ?
                     correctiveActionsAudits.map(audit => (
                        <div key={audit.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
                            <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div className="flex-grow mb-4 md:mb-0">
                                    <h3 className="text-lg font-semibold text-brand-primary">{audit.clientName}</h3>
                                    <p className="text-sm text-text-secondary">{audit.standardId} - {audit.currentStage}</p>
                                    <p className="text-xs text-yellow-600 font-semibold mt-1">Resubmitted for Review</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setReviewingAudit(audit)} className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-brand-accent transition-colors">Review</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDownload(audit); }} className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-gray-700 transition-colors">Download Evidence</button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <h4 className="mt-4 text-lg font-semibold text-text-primary">All Clear!</h4>
                                    <p className="mt-1 text-text-secondary">No clients have resubmitted corrective actions for review.</p>
                        </div>
                    )}
                </div>
            </div>
          )
      }
      if (activeTab === 'actions') {
          return (
              <ActionManager 
                  audits={audits} 
                  onUpdateAudit={onUpdateAudit} 
                  currentUser={currentAuditor} 
                  userRole="auditor" 
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
        {/* Auditor Profile Card (Top Section) */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row items-center gap-6">
            {currentAuditor && currentAuditor.photo ? (
                <img src={currentAuditor.photo} alt="Auditor Profile" className="h-24 w-24 rounded-full object-cover border-4 border-brand-secondary shadow-sm" />
            ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-3xl border-4 border-brand-secondary shadow-sm">
                    {currentAuditor?.name.charAt(0)}
                </div>
            )}
            <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-text-primary mb-2">{currentAuditor?.name}</h2>
                
                {currentAuditor?.approvedCodes && currentAuditor.approvedCodes.length > 0 && (
                    <div className="mt-2">
                        <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-1">Approved Codes:</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            {currentAuditor.approvedCodes.map(code => (
                                <span key={code} className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                                    {code}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Main Layout with Sidebar on Left */}
        <div className="flex flex-col md:flex-row items-start gap-8">
            
            {/* Sidebar Menu (Left on Desktop) */}
            <aside className="w-full md:w-64 bg-white p-4 rounded-lg shadow-md md:sticky md:top-8 flex-shrink-0">
                <nav>
                    <ul className="space-y-1">
                        {sections.map(section => {
                            const isActive = activeTab === section.id;
                            let statusIndicator = null;
                            if (section.id === 'corrective_actions' && correctiveActionsAudits.length > 0) {
                                statusIndicator = <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{correctiveActionsAudits.length}</span>;
                            }
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

            {/* Main Content Area (Right on Desktop) */}
            <main className="flex-1 w-full bg-white p-6 md:p-8 rounded-lg shadow-md min-h-[calc(100vh-200px)]">
                {renderMainContent()}
            </main>
            
        </div>

        {/* Modals */}
        {reviewingAudit && (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-2xl">
                    <h3 className="text-xl font-bold text-text-primary mb-4 border-b pb-3">Review Corrective Action: {reviewingAudit.clientName}</h3>
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                        <div>
                            <h4 className="font-semibold text-text-secondary mb-2">Upload Reviewed Evidence</h4>
                             <label className="w-full block text-center cursor-pointer bg-gray-100 hover:bg-gray-200 text-text-secondary font-semibold py-3 px-3 rounded-md text-sm transition-colors flex items-center justify-center gap-2 border-2 border-dashed">
                                <UploadIcon />
                                <span>Upload approved/rejected document(s)</span>
                                <input type="file" multiple onChange={(e) => setStagedFiles(prev => [...prev, ...Array.from(e.target.files || [])])} className="hidden" />
                            </label>
                             <div className="mt-3">
                                <h5 className="text-sm font-semibold text-text-secondary mb-2">Uploaded Evidence</h5>
                                {stagedFiles.length > 0 ? (
                                    <ul className="space-y-1 text-sm border rounded-md p-2 bg-gray-50 max-h-32 overflow-y-auto">
                                        {stagedFiles.map((file, index) => (
                                            <li key={index} className="flex justify-between items-center bg-white p-1.5 rounded">
                                                <span className="truncate pr-2">{file.name}</span>
                                                <button onClick={() => handleRemoveStagedFile(index)} className="text-red-500 hover:text-red-700 flex-shrink-0"><Trash2Icon /></button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-3 px-2 border-2 border-dashed rounded-lg bg-gray-50">
                                        <p className="text-sm text-gray-500">No uploads.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-text-secondary mb-2">Auditor Findings</h4>
                            <textarea
                                ref={textareaRef}
                                value={reviewNotes}
                                onChange={handleNotesChange}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-accent resize-none overflow-hidden"
                                placeholder="Add any findings or notes for the client..."
                            />
                        </div>
                         <div>
                            <h4 className="font-semibold text-text-secondary mb-2">Decision</h4>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer flex-1 justify-center hover:bg-green-50">
                                    <input type="radio" name="approval" value="approved" checked={approvalStatus === 'approved'} onChange={() => setApprovalStatus('approved')} className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"/>
                                    <span className="font-semibold text-green-700">Approve</span>
                                </label>
                                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer flex-1 justify-center hover:bg-red-50">
                                    <input type="radio" name="approval" value="rejected" checked={approvalStatus === 'rejected'} onChange={() => setApprovalStatus('rejected')} className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"/>
                                    <span className="font-semibold text-red-700">Reject</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                        <button onClick={resetReviewModal} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button 
                            onClick={handleReviewSubmit}
                            disabled={!approvalStatus}
                            className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-accent disabled:bg-gray-400 disabled:cursor-not-allowed">
                            Submit Review
                        </button>
                    </div>
                </div>
            </div>
        )}

      {viewingClientInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-text-primary">{viewingClientInfo.clientName}</h3>
                </div>
                
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4 -mr-4">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <InfoRow label="Client Address" value={viewingClientInfo.clientAddress} />
                        <InfoRow label="Standard" value={viewingClientInfo.standardId} />
                        <div className="md:col-span-2">
                            <InfoRow label="Scope" value={<p className="whitespace-pre-wrap">{viewingClientInfo.scope}</p>} />
                        </div>
                        <InfoRow label="IAF Code(s)" value={viewingClientInfo.iafCodes?.join(', ')} />
                        <InfoRow label="Status" value={<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${CLIENT_STATUS_CONFIG[viewingClientInfo.status]?.colors || ''}`}>{CLIENT_STATUS_CONFIG[viewingClientInfo.status]?.label}</span>} />
                        <InfoRow label="Due Date" value={formatDate(viewingClientInfo.dueDate)} />
                        <InfoRow label="Assigned Auditor" value={viewingClientInfo.assignedAuditor} />
                        <InfoRow label="Certificate Number" value={viewingClientInfo.certificateNumber} />
                    </dl>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={() => setViewingClientInfo(null)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AuditorDashboard;
