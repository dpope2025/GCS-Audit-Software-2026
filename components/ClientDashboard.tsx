
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Audit, ClientStatus, AuditorDocument, KnowledgeBaseVideo, KnowledgeBaseDocument, Clause, AuditorStatus, ActionItem } from '../types';
import { CLIENT_STATUS_CONFIG } from '../constants';
import CircularProgressBar from './CircularProgressBar';
import jsPDF from 'jspdf';

// --- ICONS ---
const BillingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const CertificateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline><path d="M12 15l-2-2 2-2 2 2-2 2z"></path><circle cx="12" cy="15" r="3"></circle></svg>;
const CompanyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const AuditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const ReportsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const EmptyFolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;
const SpinnerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>;
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;

interface ClientDashboardProps {
  audit: Audit & { clauses: Clause[] };
  onNavigateToAuditPortal: () => void;
  onUpdateAudit: (audit: Audit) => void;
  knowledgeBaseVideos: KnowledgeBaseVideo[];
  knowledgeBaseDocuments: KnowledgeBaseDocument[];
  initialSection?: string;
  isLoggedIn: boolean;
  userProfilePic: string | null;
  setUserProfilePic: (pic: string | null) => void;
}

interface AdditionalUser {
  id: string;
  name: string;
  email: string;
  title?: string;
  permissions: {
    [key: string]: boolean;
  };
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

const ClientDashboard: React.FC<ClientDashboardProps> = ({ audit, onNavigateToAuditPortal, onUpdateAudit, knowledgeBaseVideos, knowledgeBaseDocuments, initialSection = 'dashboard_home', isLoggedIn, userProfilePic, setUserProfilePic }) => {
  const [activeSection, setActiveSection] = useState<string>(initialSection);
  const [viewingEvidence, setViewingEvidence] = useState<{name: string; dataUrl: string; type: string} | null>(null);
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [resubmissionFile, setResubmissionFile] = useState<File | null>(null);
  const [auditorNotes, setAuditorNotes] = useState<string | null>(null);
  const [viewingVideo, setViewingVideo] = useState<KnowledgeBaseVideo | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdditionalUser | null>(null);
  
  // Action Items State
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
  const [actionResponse, setActionResponse] = useState('');
  const [actionResponseFiles, setActionResponseFiles] = useState<File[]>([]);
  
  const profilePicInputRef = useRef<HTMLInputElement>(null);

  // State for My Profile
  const [profileName, setProfileName] = useState(audit.clientRepName || '');
  const [profileTitle, setProfileTitle] = useState(audit.clientRepTitle || '');
  const [profileEmail, setProfileEmail] = useState(audit.clientRepEmail || '');
  
  const sections = useMemo(() => [
    { id: 'dashboard_home', title: 'Dashboard', icon: <CompanyIcon />, action: () => setActiveSection('dashboard_home') },
    { id: 'audit', title: 'AuditSync Portal', icon: <AuditIcon />, action: onNavigateToAuditPortal },
    { id: 'certs_logos', title: 'Certificate & Logos', icon: <CertificateIcon />, action: () => setActiveSection('certs_logos') },
    { id: 'knowledge_base', title: 'Knowledge Base', icon: <BookOpenIcon />, action: () => setActiveSection('knowledge_base') },
    { id: 'billing', title: 'Billing', icon: <BillingIcon />, action: () => setActiveSection('billing') },
    { id: 'actions', title: 'Admin Request', icon: <ClipboardListIcon />, action: () => setActiveSection('actions') },
    { id: 'settings', title: 'Settings', icon: <SettingsIcon />, action: () => setActiveSection('settings') },
  ], [onNavigateToAuditPortal]);

  const filteredSections = useMemo(() => {
    if (audit.status === ClientStatus.Revoked || audit.status === ClientStatus.Withdrawn) {
      return sections.filter(section => section.id === 'dashboard_home' || section.id === 'billing');
    }
    return sections;
  }, [audit.status, sections]);
  
  useEffect(() => {
    if (activeSection === 'reports') {
        return;
    }
    const isSectionAllowed = filteredSections.some(s => s.id === activeSection);
    if (!isSectionAllowed) {
      setActiveSection('dashboard_home');
    }
  }, [filteredSections, activeSection]);

  useEffect(() => {
    if (activeSection === 'reports' && audit.status === ClientStatus.CorrectiveActionApproved) {
        onUpdateAudit({ ...audit, status: ClientStatus.Valid });
    }
  }, [activeSection, audit, onUpdateAudit]);

  useEffect(() => {
    setProfileName(audit.clientRepName || '');
    setProfileTitle(audit.clientRepTitle || '');
    setProfileEmail(audit.clientRepEmail || '');
  }, [audit]);

  const progress = useMemo(() => {
    if (!audit.clauses || audit.clauses.length === 0) return 0;
    const completedStatuses = [
        AuditorStatus.Accepted,
        AuditorStatus.MinorNC,
        AuditorStatus.MajorNC,
    ];
    const completedCount = audit.statuses.filter(s => 
        s && completedStatuses.includes(s.auditorStatus)
    ).length;
    return (completedCount / audit.clauses.length) * 100;
  }, [audit.statuses, audit.clauses]);

  const outstandingActionsCount = useMemo(() => {
    return (audit.actionItems || []).filter(a => a.status === 'Open').length;
  }, [audit.actionItems]);

  const permissionOptions = filteredSections
    .filter(s => s.id !== 'dashboard_home' && s.id !== 'settings') 
    .map(s => ({ id: s.id, title: s.title }));
    
  const initialPermissions = permissionOptions.reduce((acc, curr) => ({ ...acc, [curr.id]: false }), {});

  // State for Additional Users
  const [additionalUsers, setAdditionalUsers] = useState<AdditionalUser[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserTitle, setNewUserTitle] = useState('');
  const [permissions, setPermissions] = useState<{ [key: string]: boolean }>(initialPermissions);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const hasUnreadMeetings = React.useMemo(() => {
    return (audit.meetings || []).some(meeting => !meeting.readByClient);
  }, [audit.meetings]);

  useEffect(() => {
    const notesDocument = [...(audit.auditorDocuments || [])]
      .filter(doc => doc.name === 'Auditor_Review_Notes.txt')
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())[0];

    if (notesDocument && notesDocument.dataUrl) {
      try {
        const base64Content = notesDocument.dataUrl.split(',')[1];
        if (base64Content) {
          const decodedContent = atob(base64Content);
          setAuditorNotes(decodedContent);
        } else {
            setAuditorNotes(null);
        }
      } catch (e) {
        console.error("Failed to decode auditor notes:", e);
        setAuditorNotes(null);
      }
    } else {
      setAuditorNotes(null);
    }
  }, [audit.auditorDocuments]);

  const handleResubmissionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setResubmissionFile(file);
    }
  };

  const handleCancelResubmit = () => {
    setIsResubmitModalOpen(false);
    setResubmissionFile(null);
  };

  const handleConfirmResubmit = () => {
    if (!resubmissionFile) {
        alert("Please select a file to upload.");
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const newDocument: AuditorDocument = {
            id: crypto.randomUUID(),
            name: `Corrective_Action_Resubmission_${resubmissionFile.name}`,
            type: resubmissionFile.type,
            size: resubmissionFile.size,
            dataUrl: reader.result as string,
            uploadDate: new Date().toISOString(),
        };

        const updatedAudit = {
            ...audit,
            auditorDocuments: [...(audit.auditorDocuments || []).filter(d => d.name !== 'Auditor_Review_Notes.txt'), newDocument],
            status: ClientStatus.CorrectiveActionPendingReview,
        };

        onUpdateAudit(updatedAudit);

        alert('Corrective actions and the new document have been resubmitted for review.');
        handleCancelResubmit();
        setActiveSection('reports');
    };
    reader.onerror = () => {
        alert("There was an error reading the file.");
        console.error("File reading error");
    };
    reader.readAsDataURL(resubmissionFile);
  };
  
  const isDirectVideoLink = (url: string) => {
    return /\.(mp4|webm|ogg)$/i.test(url.split('?')[0]);
  };
  
  const handleSaveProfile = () => {
      onUpdateAudit({ ...audit, clientRepName: profileName, clientRepEmail: profileEmail, clientRepTitle: profileTitle });
      alert('Profile updated successfully!');
  };

  const handlePermissionChange = (permissionId: string) => {
      setPermissions(prev => ({ ...prev, [permissionId]: !prev[permissionId] }));
  };

  const resetUserForm = () => {
      setNewUserName('');
      setNewUserEmail('');
      setNewUserTitle('');
      setPermissions(initialPermissions);
      setEditingUserId(null);
  };
  
  const handleInviteUser = () => {
      if (!newUserName.trim() || !newUserEmail.trim()) {
          alert('Please enter a name and email for the new user.');
          return;
      }

      if (editingUserId) {
          setAdditionalUsers(users => users.map(user => user.id === editingUserId ? { ...user, name: newUserName, email: newUserEmail, title: newUserTitle, permissions } : user));
          alert(`User ${newUserName} updated successfully.`);
      } else {
          const newUser: AdditionalUser = {
              id: crypto.randomUUID(),
              name: newUserName,
              email: newUserEmail,
              title: newUserTitle,
              permissions
          };
          setAdditionalUsers(users => [...users, newUser]);
          alert(`Invitation sent to ${newUserName}.`);
      }
      resetUserForm();
  };

  const handleEditUser = (user: AdditionalUser) => {
      setEditingUserId(user.id);
      setNewUserName(user.name);
      setNewUserEmail(user.email);
      setNewUserTitle(user.title || '');
      setPermissions(user.permissions);
  };
  
  const handleDeleteUser = (user: AdditionalUser) => {
      setUserToDelete(user);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    setAdditionalUsers(users => users.filter(user => user.id !== userToDelete.id));
    setUserToDelete(null);
  }

  const triggerProfilePicInput = () => profilePicInputRef.current?.click();

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Action Items Handlers ---
  const handleActionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          setActionResponseFiles(prev => [...prev, ...Array.from(e.target.files!)]);
      }
  };
  
  const handleRemoveActionFile = (index: number) => {
      setActionResponseFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSendActionResponse = async (actionId: string) => {
      if (!actionResponse.trim() && actionResponseFiles.length === 0) {
          alert('Please provide a response description or attach files.');
          return;
      }
      
      // Process files
      const uploadedDocs: AuditorDocument[] = [];
      if (actionResponseFiles.length > 0) {
        const filePromises = actionResponseFiles.map(file => {
            return new Promise<AuditorDocument>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve({
                    id: crypto.randomUUID(),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    dataUrl: reader.result as string,
                    uploadDate: new Date().toISOString(),
                });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });
        
        try {
            const docs = await Promise.all(filePromises);
            uploadedDocs.push(...docs);
        } catch (e) {
            console.error("Error uploading files", e);
            alert("Error uploading files. Please try again.");
            return;
        }
      }

      // Update Audit
      const updatedActions = (audit.actionItems || []).map(action => {
          if (action.id === actionId) {
              return {
                  ...action,
                  status: 'In Review',
                  clientResponse: actionResponse,
                  clientResponseDocuments: [...(action.clientResponseDocuments || []), ...uploadedDocs],
                  responseDate: new Date().toISOString(),
              } as ActionItem;
          }
          return action;
      });
      
      onUpdateAudit({ ...audit, actionItems: updatedActions });
      setActionResponse('');
      setActionResponseFiles([]);
      setExpandedActionId(null);
      alert('Action response sent to sender.');
  };

  const generateStatusReportPdf = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxW = pageW - margin * 2;
    let y = margin;

    if (audit.clientLogo) {
        try {
            const imgData = audit.clientLogo;
            let format = null;
            if (imgData.startsWith('data:image/png')) {
                format = 'PNG';
            } else if (imgData.startsWith('data:image/jpeg') || imgData.startsWith('data:image/jpg')) {
                format = 'JPEG';
            } else if (imgData.startsWith('data:image/bmp')) {
                format = 'BMP';
            }
            if (format) {
                const imgProps = doc.getImageProperties(imgData);
                const ratio = imgProps.width / imgProps.height;
                const imgHeight = 20;
                const imgWidth = imgHeight * ratio;
                doc.addImage(imgData, format, pageW - margin - imgWidth, y, imgWidth, imgHeight);
            }
        } catch(e) { 
            console.warn("Could not add client logo to PDF", e); 
        }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor('#172B4D');
    doc.text(audit.clientName, margin, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor('#5E6C84');
    doc.text('Audit Status Report', margin, y + 12);

    y += 30;
    doc.setDrawColor('#DFE1E6');
    doc.line(margin, y, pageW - margin, y);
    y += 15;

    const drawInfo = (label: string, value: string, x_offset = 0) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#5E6C84');
        doc.text(label.toUpperCase(), margin + x_offset, y);

        doc.setFontSize(9); 
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#172B4D');
        doc.text(value, margin + x_offset, y + 5);
        y += 15;
    };
    
    drawInfo('Standard', audit.standardId);
    drawInfo('Audit Cycle', audit.currentStage);
    drawInfo('Due Date', formatDate(audit.dueDate));
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#5E6C84');
    doc.text('STATUS', margin, y);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#0052CC');
    doc.text(CLIENT_STATUS_CONFIG[audit.status]?.label || audit.status, margin, y + 6);
    y += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#172B4D');
    doc.text('Overall Progress', margin, y);
    doc.setFontSize(18);
    doc.text(`${Math.round(progress)}%`, pageW - margin, y, { align: 'right' });
    y += 8;
    
    doc.setFillColor('#DFE1E6');
    doc.rect(margin, y, maxW, 6, 'F');
    doc.setFillColor('#0052CC');
    doc.rect(margin, y, maxW * (progress / 100), 6, 'F');
    y += 20;

    const sortedClauses = audit.clauses.sort((a, b) => (a.id > b.id) ? 1 : -1);
    const sections = [...new Set(sortedClauses.map(c => {
        if(c.id.startsWith('Q-')) return 'Stage 1 Questions';
        return `Clause ${c.id.split('.')[0]}`;
    }))];

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Section-wise Progress', margin, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    sections.forEach(sectionName => {
        if (y > 260) {
            doc.addPage();
            y = margin;
        }

        const sectionClauses = sortedClauses.filter(c => {
            if (c.id.startsWith('Q-')) return sectionName === 'Stage 1 Questions';
            return `Clause ${c.id.split('.')[0]}` === sectionName;
        });
        const sectionProgress = (sectionClauses.filter(c => [AuditorStatus.Accepted, AuditorStatus.MinorNC, AuditorStatus.MajorNC].includes(audit.statuses.find(s => s.clauseId === c.id)?.auditorStatus || AuditorStatus.NotStarted)).length / sectionClauses.length) * 100;

        doc.setTextColor('#172B4D');
        doc.text(sectionName, margin, y);
        doc.setTextColor('#5E6C84');
        doc.text(`${Math.round(sectionProgress)}%`, pageW - margin, y, { align: 'right' });
        y += 5;
        
        doc.setFillColor('#DFE1E6');
        doc.rect(margin, y, maxW, 4, 'F');
        doc.setFillColor('#4C9AFF');
        doc.rect(margin, y, maxW * (sectionProgress / 100), 4, 'F');
        y += 10;
    });

    doc.setDrawColor('#DFE1E6');
    doc.line(margin, 280, pageW - margin, 280);
    doc.setFontSize(8);
    doc.setTextColor('#5E6C84');
    doc.text(`Report generated on ${formatDate(new Date().toISOString())}`, margin, 285);
    doc.text('GCS AuditSync Portal', pageW - margin, 285, { align: 'right' });
    
    doc.save(`${audit.clientName}_Status_Report_${formatDate(new Date().toISOString())}.pdf`);
  };

  const renderSectionContent = () => {
    if (activeSection === 'dashboard_home') {
        return (
            <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome to your Dashboard</h2>
                <p className="text-text-secondary">
                    This is your central hub for managing your audit and certification. Use the menu on the left to navigate to different sections of the portal.
                </p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 bg-brand-secondary rounded-lg border border-border-color">
                        <h3 className="text-lg font-semibold text-text-primary">Current Audit Status</h3>
                        <div className="flex items-center gap-4 mt-2">
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${CLIENT_STATUS_CONFIG[audit.status]?.colors || 'bg-gray-100 text-gray-800'}`}>
                                {CLIENT_STATUS_CONFIG[audit.status]?.label || audit.status}
                            </span>
                            <p className="text-text-secondary text-sm">{audit.standardId}</p>
                        </div>
                    </div>
                    <div className="p-6 bg-brand-secondary rounded-lg border border-border-color flex flex-col items-center">
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Overall Progress</h3>
                        <CircularProgressBar progress={progress} size={80} strokeWidth={8} />
                    </div>
                     {/* Outstanding Actions Card */}
                    <button 
                        onClick={() => setActiveSection('actions')}
                        className="p-6 bg-white rounded-lg border border-red-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center cursor-pointer group relative overflow-hidden"
                    >
                         <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
                         <div className="flex items-center gap-3 mb-2">
                             <AlertCircleIcon />
                             <h3 className="text-lg font-semibold text-text-primary">Outstanding Admin Requests</h3>
                         </div>
                         <p className="text-4xl font-bold text-red-600 group-hover:scale-110 transition-transform">{outstandingActionsCount}</p>
                         <p className="text-sm text-text-secondary mt-2">Items requiring your attention</p>
                    </button>
                </div>
                 <div className="mt-6 flex justify-end">
                    <button
                        onClick={generateStatusReportPdf}
                        className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-brand-accent transition-colors flex items-center gap-2"
                    >
                        <PrintIcon /> Print Status Report
                    </button>
                </div>
            </div>
        )
    }
    
    if (activeSection === 'actions') {
        const actions = audit.actionItems || [];
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-text-primary">Admin Request Items Dashboard</h3>
                </div>
                
                {actions.length > 0 ? (
                    <div className="space-y-4">
                        {actions.map(action => {
                            const isExpanded = expandedActionId === action.id;
                            const isClosed = action.status === 'Closed';
                            return (
                                <div key={action.id} className={`border rounded-lg overflow-hidden transition-all ${isExpanded ? 'shadow-md ring-1 ring-brand-primary' : 'shadow-sm hover:shadow-md'}`}>
                                    <div 
                                        onClick={() => setExpandedActionId(isExpanded ? null : action.id)}
                                        className="p-4 bg-white flex justify-between items-center cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${action.status === 'Open' ? 'bg-red-100 text-red-600' : action.status === 'In Review' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                                                {action.status === 'Open' ? <AlertCircleIcon/> : <ClipboardListIcon/>}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-text-primary text-lg">{action.title}</h4>
                                                <div className="flex items-center gap-3 text-sm text-text-secondary mt-1">
                                                    <span>From: <span className="font-medium">{action.senderName}</span> ({action.senderRole})</span>
                                                    <span>•</span>
                                                    <span className={`${action.priority === 'High' ? 'text-red-600 font-bold' : action.priority === 'Medium' ? 'text-orange-500 font-medium' : 'text-green-600'}`}>
                                                        {action.priority} Priority
                                                    </span>
                                                     {action.dueDate && (
                                                        <>
                                                            <span>•</span>
                                                            <span>Due: {formatDate(action.dueDate)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${action.status === 'Open' ? 'bg-red-100 text-red-800' : action.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                {action.status}
                                            </span>
                                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div className="p-6 bg-gray-50 border-t">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                <div>
                                                    <h5 className="font-semibold text-text-primary mb-2">Description</h5>
                                                    <div className="bg-white p-4 rounded-lg border text-text-secondary text-sm whitespace-pre-wrap mb-4">
                                                        {action.description}
                                                    </div>
                                                    
                                                    {action.attachments && action.attachments.length > 0 && (
                                                        <div className="mb-6">
                                                             <h5 className="font-semibold text-text-primary mb-2">Attachments from Sender</h5>
                                                             <div className="space-y-2">
                                                                {action.attachments.map((file, idx) => (
                                                                    <div key={idx} className="flex items-center justify-between p-2 bg-white border rounded-md">
                                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                                            <FileTextIcon />
                                                                            <span className="text-sm text-blue-600 truncate">{file.name}</span>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                             <button onClick={() => setViewingEvidence({name: file.name, dataUrl: file.dataUrl, type: file.type})} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700">View</button>
                                                                             <a href={file.dataUrl} download={file.name} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700"><DownloadIcon/></a>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                             </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div>
                                                    <h5 className="font-semibold text-text-primary mb-2">Your Response</h5>
                                                    {isClosed ? (
                                                        <div className="bg-gray-100 p-4 rounded-lg border text-text-secondary text-sm">
                                                            <p className="font-medium mb-1">Response:</p>
                                                            <p className="mb-3 whitespace-pre-wrap">{action.clientResponse || "No text response provided."}</p>
                                                            
                                                            {action.clientResponseDocuments && action.clientResponseDocuments.length > 0 && (
                                                                <>
                                                                    <p className="font-medium mb-1">Attached Files:</p>
                                                                     <ul className="space-y-1">
                                                                        {action.clientResponseDocuments.map((f, i) => (
                                                                            <li key={i} className="flex items-center gap-2 text-blue-600">
                                                                                 <FileTextIcon /> {f.name}
                                                                            </li>
                                                                        ))}
                                                                     </ul>
                                                                </>
                                                            )}
                                                            <p className="mt-4 text-green-600 font-bold text-center border-t pt-2">This action item is Closed.</p>
                                                        </div>
                                                    ) : action.status === 'In Review' ? (
                                                         <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 text-center">
                                                            <p>You have submitted a response. Please wait for the sender to review it.</p>
                                                         </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            <textarea 
                                                                value={actionResponse}
                                                                onChange={(e) => setActionResponse(e.target.value)}
                                                                className="w-full input-field min-h-[100px]" 
                                                                placeholder="Enter your response details here..."
                                                            />
                                                            <div>
                                                                <label className="block text-sm font-medium text-text-secondary mb-2">Attach Files (optional)</label>
                                                                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                                    <div className="text-center">
                                                                        <UploadIcon />
                                                                        <span className="mt-1 block text-xs text-gray-500">Click to upload</span>
                                                                    </div>
                                                                    <input type="file" multiple onChange={handleActionFileChange} className="hidden" />
                                                                </label>
                                                                {actionResponseFiles.length > 0 && (
                                                                    <ul className="mt-2 space-y-1">
                                                                        {actionResponseFiles.map((f, i) => (
                                                                            <li key={i} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                                                                                <span className="truncate">{f.name}</span>
                                                                                <button onClick={() => handleRemoveActionFile(i)} className="text-red-500 hover:text-red-700"><TrashIcon/></button>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                            <div className="flex justify-end pt-2">
                                                                <button 
                                                                    onClick={() => handleSendActionResponse(action.id)}
                                                                    className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-accent transition-colors flex items-center gap-2 shadow-md"
                                                                >
                                                                    <SendIcon /> Resend to Sender
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-lg border">
                        <ClipboardListIcon />
                        <h3 className="mt-4 text-lg font-semibold text-text-primary">No Action Items</h3>
                        <p className="text-text-secondary">You have no outstanding actions at this time.</p>
                    </div>
                )}
            </div>
        );
    }

    if (activeSection === 'reports') {
        const otherDocs = (audit.auditorDocuments || [])
            .filter(doc => doc.name !== 'Auditor_Review_Notes.txt')
            .sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
            
        return (
            <div className="space-y-8">
                 {audit.status === ClientStatus.ActionRequired && (
                    <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                        <h4 className="font-bold text-yellow-800">Action Required</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                            The technical reviewer has requested corrective actions. Please review the auditor reports below, address the issues, and resubmit for approval when ready.
                        </p>
                        <button
                            onClick={() => setIsResubmitModalOpen(true)}
                            className="mt-3 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-brand-accent transition-colors"
                        >
                            Resubmit for Approval
                        </button>
                    </div>
                )}
                {auditorNotes && (
                    <div className="mb-6 p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg">
                        <h4 className="font-bold text-indigo-800">Auditor Findings & Notes</h4>
                        <p className="text-sm text-indigo-900 mt-2 whitespace-pre-wrap bg-white/50 p-3 rounded-md border border-indigo-100">
                            {auditorNotes}
                        </p>
                    </div>
                )}
                <div>
                     <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h4 className="text-xl font-semibold text-text-primary">Auditor Reports & Corrective Action Requests</h4>
                        <button
                            onClick={onNavigateToAuditPortal}
                            className="font-semibold text-brand-primary hover:underline flex items-center gap-2 text-sm"
                        >
                            <ArrowLeftIcon />
                            Return to AuditSync Portal
                        </button>
                    </div>
                    {otherDocs.length > 0 ? (
                        <div className="space-y-3">
                            {otherDocs.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                    <div className="flex items-center gap-3 flex-grow min-w-0">
                                        <FileTextIcon />
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm text-brand-primary font-medium truncate">{doc.name}</p>
                                            <p className="text-xs text-text-secondary">Uploaded: {formatDate(doc.uploadDate)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => setViewingEvidence({name: doc.name, dataUrl: doc.dataUrl, type: doc.type})} className="text-sm font-semibold bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-50 transition-colors">View</button>
                                        <a href={doc.dataUrl} download={doc.name} className="text-sm font-semibold bg-brand-primary text-white px-3 py-1 rounded-md hover:bg-brand-accent transition-colors flex items-center gap-1.5">
                                            <DownloadIcon /> Download
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <EmptyFolderIcon />
                            <h3 className="mt-4 text-lg text-text-secondary font-semibold">No Auditor Reports Found</h3>
                            <p className="mt-1 text-gray-500 text-sm">Your auditor has not uploaded any reports for this audit cycle yet.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    } else if (activeSection === 'certs_logos') {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-xl font-semibold text-text-primary mb-4 border-b pb-2">Certificates</h4>
                    <div className="text-center py-10 bg-gray-50 rounded-lg">
                        <EmptyFolderIcon />
                        <h3 className="mt-4 text-lg text-text-secondary font-semibold">No Certificates Available</h3>
                        <p className="mt-1 text-gray-500 text-sm">Your official certificates will appear here once issued.</p>
                    </div>
                </div>
                <div>
                    <h4 className="text-xl font-semibold text-text-primary mb-4 border-b pb-2">Logos</h4>
                    <div className="text-center py-10 bg-gray-50 rounded-lg">
                        <EmptyFolderIcon />
                        <h3 className="mt-4 text-lg text-text-secondary font-semibold">No Logos Available</h3>
                        <p className="mt-1 text-gray-500 text-sm">Your certification logos for marketing purposes will be available for download here.</p>
                    </div>
                </div>
            </div>
        );
    } else if (activeSection === 'knowledge_base') {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-xl font-semibold text-text-primary mb-4 border-b pb-2">Videos</h4>
                    {knowledgeBaseVideos.length > 0 ? (
                         <div className="space-y-3">
                            {knowledgeBaseVideos.map(video => (
                                <div key={video.id} className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                    <p className="text-sm text-brand-primary font-medium truncate flex-grow">{video.title}</p>
                                    <button
                                        onClick={() => setViewingVideo(video)}
                                        className="text-sm font-semibold bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-accent transition-colors flex items-center gap-1.5 flex-shrink-0"
                                    >
                                        <PlayIcon /> Play
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <EmptyFolderIcon />
                            <h3 className="mt-4 text-lg text-text-secondary font-semibold">No Videos Available</h3>
                            <p className="mt-1 text-gray-500 text-sm">Check back later for helpful videos and tutorials.</p>
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="text-xl font-semibold text-text-primary mb-4 border-b pb-2">Documents</h4>
                    {knowledgeBaseDocuments.length > 0 ? (
                        <div className="space-y-3">
                            {knowledgeBaseDocuments.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                    <div className="flex items-center gap-3 flex-grow min-w-0">
                                        <FileTextIcon />
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm text-brand-primary font-medium truncate">{doc.title || doc.name}</p>
                                            <p className="text-xs text-text-secondary">Uploaded: {formatDate(doc.uploadDate)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => setViewingEvidence({name: doc.name, dataUrl: doc.dataUrl, type: doc.type})} className="text-sm font-semibold bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-50 transition-colors">View</button>
                                        <a href={doc.dataUrl} download={doc.name} className="text-sm font-semibold bg-brand-primary text-white px-3 py-1 rounded-md hover:bg-brand-accent transition-colors flex items-center gap-1.5">
                                            <DownloadIcon /> Download
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <EmptyFolderIcon />
                            <h3 className="mt-4 text-lg text-text-secondary font-semibold">No Documents Available</h3>
                            <p className="mt-1 text-gray-500 text-sm">Helpful documents and templates will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    } else if (activeSection === 'settings') {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-12">
                {/* My Profile Section */}
                <div>
                    <h4 className="text-xl font-semibold text-text-primary border-b pb-3 mb-6">My Profile</h4>
                     {isLoggedIn && (
                        <div className="flex flex-col items-center mb-6">
                            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-brand-primary/20 shadow-sm">
                                {userProfilePic ? (
                                    <img src={userProfilePic} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-4xl text-text-secondary">{profileName.charAt(0)}</span>
                                )}
                            </div>
                            <button onClick={triggerProfilePicInput} className="mt-3 text-sm font-semibold text-brand-primary hover:underline">
                                Change Picture
                            </button>
                            <input type="file" ref={profilePicInputRef} onChange={handleProfilePicChange} className="hidden" accept="image/*" />
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                            <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Title/Position</label>
                            <input type="text" value={profileTitle} onChange={(e) => setProfileTitle(e.target.value)} className="w-full input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                            <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="w-full input-field" />
                        </div>
                        <div className="text-right pt-2">
                          <button onClick={handleSaveProfile} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-brand-accent transition-colors">
                              Save Changes
                          </button>
                        </div>
                    </div>
                </div>

                {/* Additional Users Section */}
                <div className="space-y-6">
                     <h4 className="text-xl font-semibold text-text-primary border-b pb-3">Additional Users</h4>
                     <div className="p-4 border border-border-color rounded-lg bg-gray-50">
                        <h5 className="font-semibold text-text-primary mb-3">{editingUserId ? 'Edit User' : 'Invite New User'}</h5>
                        <div className="space-y-3">
                            <input type="text" placeholder="Full Name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="w-full input-field" />
                            <input type="email" placeholder="Email Address" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full input-field" />
                             <input type="text" placeholder="Title/Position" value={newUserTitle} onChange={(e) => setNewUserTitle(e.target.value)} className="w-full input-field" />
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Permissions</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {permissionOptions.map(p => (
                                      <label key={p.id} className="flex items-center space-x-2 cursor-pointer">
                                          <input
                                              type="checkbox"
                                              checked={permissions[p.id] || false}
                                              onChange={() => handlePermissionChange(p.id)}
                                              className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-accent"
                                          />
                                          <span className="text-sm text-text-secondary">{p.title}</span>
                                      </label>
                                  ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                           {editingUserId && <button onClick={resetUserForm} className="bg-gray-200 text-gray-800 font-medium py-2 px-3 rounded-lg text-sm hover:bg-gray-300">Cancel</button>}
                           <button onClick={handleInviteUser} className="bg-brand-primary text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-brand-accent">
                                {editingUserId ? 'Update User' : 'Invite User'}
                           </button>
                        </div>
                     </div>
                     <div className="space-y-3">
                        {additionalUsers.length > 0 ? additionalUsers.map(user => (
                            <div key={user.id} className="p-3 border rounded-md bg-white flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-text-primary">{user.name}</p>
                                    {user.title && <p className="text-sm font-medium text-gray-600">{user.title}</p>}
                                    <p className="text-sm text-text-secondary">{user.email}</p>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                                      {permissionOptions.map(p => (
                                          <span key={p.id} className={`text-xs font-medium ${user.permissions[p.id] ? 'text-green-700' : 'text-gray-400'}`}>
                                              {p.title}
                                          </span>
                                      ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0 ml-2">
                                    <button onClick={() => handleEditUser(user)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"><PencilIcon/></button>
                                    <button onClick={() => handleDeleteUser(user)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-colors"><TrashIcon/></button>
                                </div>
                            </div>
                        )) : (
                          <p className="text-center text-sm text-gray-500 italic py-4">No additional users have been invited.</p>
                        )}
                     </div>
                </div>
            </div>
        );
    }

    return (
      <div className="text-center py-16">
          <EmptyFolderIcon />
          <h3 className="mt-4 text-xl text-text-secondary font-semibold">No Data Available</h3>
          <p className="mt-2 text-gray-500">This section is currently under development. Please check back later.</p>
      </div>
    );
  }

  const mainContent = (
    <main className="flex-1 w-full bg-white p-6 md:p-8 rounded-lg shadow-md min-h-[calc(100vh-200px)]">
      {renderSectionContent()}
    </main>
  );
  
  return (
    <div>
      {activeSection === 'reports' ? (
        mainContent
      ) : (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex items-center gap-6">
                {audit.clientLogo ? (
                    <img src={audit.clientLogo} alt={`${audit.clientName} Logo`} className="h-20 w-20 object-contain rounded-md border p-1 flex-shrink-0" />
                ) : (
                    <div className="h-20 w-20 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-2xl flex-shrink-0">
                        {audit.clientName.charAt(0)}
                    </div>
                )}
                <div>
                    <h2 className="text-3xl font-bold text-text-primary">{audit.clientName}</h2>
                    <p className="text-text-secondary mt-1">{audit.clientAddress}</p>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-start gap-8">
                {/* Sidebar Menu */}
                <aside className="w-full md:w-64 bg-white p-4 rounded-lg shadow-md md:sticky md:top-8 flex-shrink-0">
                    <nav>
                        <ul className="space-y-1">
                            {filteredSections.map(section => {
                                const isActive = activeSection === section.id;
                                let statusIndicator = null;
                                const actionRequiredStatuses = [
                                    ClientStatus.ActionRequired,
                                    ClientStatus.CorrectiveActionPendingReview,
                                    ClientStatus.CorrectiveActionApproved,
                                ];
                                const hasActionRequired = actionRequiredStatuses.includes(audit.status);
                                const hasUnreadNotes = (audit.generalNotes || []).some(note => !note.readByClient);

                                if ((section.id === 'audit') && (hasActionRequired || hasUnreadNotes || hasUnreadMeetings)) {
                                    statusIndicator = <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                                }
                                
                                if (section.id === 'actions' && outstandingActionsCount > 0) {
                                     statusIndicator = <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{outstandingActionsCount}</span>
                                }

                                return (
                                    <li key={section.id}>
                                        <button
                                            onClick={section.action}
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
                                )
                            })}
                        </ul>
                    </nav>
                </aside>
                {mainContent}
            </div>
        </>
      )}
      
      {isResubmitModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg">
                <h3 className="text-xl font-bold text-text-primary mb-4">Resubmit Corrective Actions</h3>
                <p className="text-sm text-text-secondary mb-4">
                    Please upload your updated corrective action report. This will be sent to the reviewer for approval.
                </p>
                <div className="space-y-4">
                    <label className="w-full block text-center cursor-pointer bg-brand-secondary hover:bg-gray-200 text-text-primary font-semibold py-4 px-3 rounded-md text-sm transition-colors flex flex-col items-center justify-center gap-2 border-2 border-dashed">
                        <UploadIcon />
                        <span className="truncate max-w-full px-2">{resubmissionFile ? resubmissionFile.name : 'Click to upload document'}</span>
                        <input type="file" onChange={handleResubmissionFileChange} className="hidden" />
                    </label>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={handleCancelResubmit} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button 
                        onClick={handleConfirmResubmit} 
                        disabled={!resubmissionFile}
                        className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-accent disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Submit for Review
                    </button>
                </div>
            </div>
        </div>
      )}

      {viewingEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setViewingEvidence(null)}>
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-text-primary truncate pr-4">{viewingEvidence.name}</h3>
                    <div className="flex items-center gap-4">
                        <a href={viewingEvidence.dataUrl} download={viewingEvidence.name} className="flex items-center gap-2 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-accent transition-colors text-sm">
                            <DownloadIcon /> Download
                        </a>
                        <button onClick={() => setViewingEvidence(null)} className="text-gray-500 hover:text-gray-800 text-3xl font-bold leading-none">&times;</button>
                    </div>
                </div>
                <div className="flex-grow overflow-auto">
                    {viewingEvidence.type.startsWith('image/') ? (
                        <img src={viewingEvidence.dataUrl} alt={viewingEvidence.name} className="max-w-full h-auto mx-auto" />
                    ) : viewingEvidence.type === 'application/pdf' ? (
                        <iframe src={viewingEvidence.dataUrl} className="w-full h-[75vh]" title={viewingEvidence.name}></iframe>
                    ) : (
                        <div className="text-center p-8">
                            <p className="text-text-secondary">No preview available for this file type.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {viewingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setViewingVideo(null)}>
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-text-primary truncate pr-4">{viewingVideo.title}</h3>
                    <button onClick={() => setViewingVideo(null)} className="text-gray-500 hover:text-gray-800 text-3xl font-bold leading-none">&times;</button>
                </div>
                <div className="flex-grow overflow-auto bg-black flex items-center justify-center rounded-md aspect-w-16 aspect-h-9">
                    {isDirectVideoLink(viewingVideo.url) ? (
                        <video src={viewingVideo.url} controls autoPlay className="max-w-full max-h-full">
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <iframe
                            src={viewingVideo.embedUrl}
                            title={viewingVideo.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    )}
                </div>
            </div>
        </div>
      )}
      
      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h3 className="text-2xl font-bold mb-4 text-red-600">Confirm Deletion</h3>
                <p className="text-text-secondary mb-6">
                    Are you sure you want to permanently remove the user: <br/>"<span className="font-semibold">{userToDelete.name}</span>"?
                </p>
                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={() => setUserToDelete(null)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={confirmDeleteUser}
                        className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
        .aspect-w-16 { position: relative; padding-bottom: 56.25%; }
        .aspect-h-9 { /* no styles needed */ }
        .aspect-w-16 > iframe, .aspect-w-16 > div, .aspect-w-16 > video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
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

export default ClientDashboard;
