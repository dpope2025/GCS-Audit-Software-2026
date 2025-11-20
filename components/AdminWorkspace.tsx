
import React, { useState, useMemo } from 'react';
import { Audit, Auditor, ClientStatus } from '../types';
import { ActionManager } from './ActionManager';

// Inlined Icons
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const AwardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;


interface AdminWorkspaceProps {
  audits: Audit[];
  onUpdateAudit: (audit: Audit) => void;
  auditors: Auditor[];
  setAuditors: (auditors: Auditor[] | ((val: Auditor[]) => Auditor[])) => void;
}

const AdminWorkspace: React.FC<AdminWorkspaceProps> = ({ audits, onUpdateAudit, auditors, setAuditors }) => {
  const [activeTab, setActiveTab] = useState<'pending_certification' | 'certified_packages' | 'actions' | 'settings'>('pending_certification');
  const [certifyingAudit, setCertifyingAudit] = useState<Audit | null>(null);
  const [newCertificateNumber, setNewCertificateNumber] = useState('');

  // User/Profile State
  const currentUser = auditors[0];
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profileSignature, setProfileSignature] = useState(currentUser?.signature || '');

  const pendingCertificationAudits = useMemo(() => {
    return audits.filter(audit => audit.status === ClientStatus.Valid && !audit.certificateNumber);
  }, [audits]);

  const certifiedAudits = useMemo(() => {
    return audits.filter(audit => !!audit.certificateNumber);
  }, [audits]);

  const pendingActionCount = useMemo(() => {
      let count = 0;
      audits.forEach(audit => {
          (audit.actionItems || []).forEach(action => {
              if (action.senderRole === 'Admin' && action.status === 'In Review') {
                  count++;
              }
          });
      });
      return count;
  }, [audits]);

  const handleIssueCertificate = () => {
    if (!certifyingAudit || !newCertificateNumber.trim()) {
      alert('Please enter a certificate number.');
      return;
    }
    const updatedAudit = { ...certifyingAudit, certificateNumber: newCertificateNumber.trim() };
    onUpdateAudit(updatedAudit);
    setCertifyingAudit(null);
    setNewCertificateNumber('');
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
      { id: 'pending_certification', title: 'Pending Certificate', icon: <ClockIcon /> },
      { id: 'certified_packages', title: 'Certified Packages', icon: <AwardIcon /> },
      { id: 'actions', title: 'Admin Request', icon: <ClipboardListIcon /> },
      { id: 'settings', title: 'Settings', icon: <SettingsIcon /> },
  ];

  const renderMainContent = () => {
      if (activeTab === 'pending_certification') {
          return (
            <div className="">
                <h3 className="text-2xl font-bold text-text-primary mb-6">Clients Pending Certification ({pendingCertificationAudits.length})</h3>
                {pendingCertificationAudits.length > 0 ? (
                  <div className="space-y-3">
                    {pendingCertificationAudits.map(audit => (
                      <div key={audit.id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50 bg-white shadow-sm transition-colors">
                        <div>
                          <p className="font-semibold text-brand-primary text-lg">{audit.clientName}</p>
                          <p className="text-sm text-text-secondary">{audit.standardId}</p>
                        </div>
                        <button
                          onClick={() => setCertifyingAudit(audit)}
                          className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          Generate & Issue Certificate
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                     <ClockIcon />
                     <p className="mt-4 text-lg font-semibold text-text-secondary">No clients are currently pending certification.</p>
                  </div>
                )}
            </div>
          );
      }
      if (activeTab === 'certified_packages') {
          return (
            <div className="">
              <h3 className="text-2xl font-bold text-text-primary mb-6">Certified Client Packages</h3>
              {certifiedAudits.length > 0 ? (
                <div className="space-y-3">
                  {certifiedAudits.map(audit => (
                    <div key={audit.id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50 bg-white shadow-sm transition-colors">
                      <div>
                        <p className="font-semibold text-text-primary text-lg">{audit.clientName}</p>
                        <p className="text-sm text-text-secondary">Cert #: {audit.certificateNumber}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-sm font-semibold bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-300">View Certificate</button>
                        <button className="text-sm font-semibold bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-300">Download Logos</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                    <AwardIcon />
                    <p className="mt-4 text-lg font-semibold text-text-secondary">No certified client packages have been issued yet.</p>
                </div>
              )}
            </div>
          );
      }
      if (activeTab === 'actions') {
          return (
              <ActionManager 
                  audits={audits} 
                  onUpdateAudit={onUpdateAudit} 
                  currentUser={currentUser} 
                  userRole="admin" 
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
                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded border border-indigo-200 uppercase tracking-wider">
                    Administrator
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

      {certifyingAudit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
            <h3 className="text-2xl font-bold text-text-primary mb-4">Issue Certificate</h3>
            <p className="text-text-secondary mb-6">
              Enter the certificate number for <span className="font-semibold">{certifyingAudit.clientName}</span>. This will mark them as certified.
            </p>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Certificate Number</label>
              <input
                type="text"
                value={newCertificateNumber}
                onChange={(e) => setNewCertificateNumber(e.target.value)}
                className="w-full input-field"
                placeholder="e.g., GCS-QMS-00X"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setCertifyingAudit(null)}
                className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleIssueCertificate}
                className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-accent transition-colors"
              >
                Save & Issue
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .input-field {
            padding: 0.5rem 0.75rem;
            border: 1px solid #DFE1E6;
            border-radius: 0.375rem;
            background-color: #FAFBFC;
        }
        .input-field:focus {
            outline: none;
            box-shadow: 0 0 0 2px #4C9AFF;
            background-color: white;
        }
      `}</style>
    </div>
  );
};

export default AdminWorkspace;
