
import React, { useState, useMemo } from 'react';
import { Audit, Auditor, Workflow, KnowledgeBaseVideo, KnowledgeBaseDocument, ClientStatus, UserRole, FormTemplate } from '../types';
import { AUDITOR_APPROVAL_CODES } from '../constants';
import WorkflowManager from './WorkflowManager';
import ClientManager from './ClientManager';
import KnowledgeBaseManager from './KnowledgeBaseManager';
import AuditRecordsManager from './AuditRecordsManager';
import { ActionManager } from './ActionManager';
import { FormBuilder } from './FormBuilder';
import useLocalStorage from '../hooks/useLocalStorage';

// Inlined SVGs
const LayoutGridIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const GitMergeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M6 21V9a9 9 0 0 0 9 9"></path></svg>;
const ArchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const BadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.78"></path></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;

interface AdminPortalProps {
  audits: Audit[];
  auditors: Auditor[];
  setAuditors: (auditors: Auditor[] | ((val: Auditor[]) => Auditor[])) => void;
  workflows: Workflow[];
  setWorkflows: (workflows: Workflow[] | ((val: Workflow[]) => Workflow[])) => void;
  knowledgeBaseVideos: KnowledgeBaseVideo[];
  setKnowledgeBaseVideos: (videos: KnowledgeBaseVideo[] | ((val: KnowledgeBaseVideo[]) => KnowledgeBaseVideo[])) => void;
  knowledgeBaseDocuments: KnowledgeBaseDocument[];
  setKnowledgeBaseDocuments: (documents: KnowledgeBaseDocument[] | ((val: KnowledgeBaseDocument[]) => KnowledgeBaseDocument[])) => void;
  onSelectAudit: (auditId: string) => void;
  onCreateAudit: (audit: Audit) => void;
  onUpdateAudit: (audit: Audit) => void;
  onDeleteAudit: (auditId: string) => void;
  userRole: UserRole;
}

const AdminPortal: React.FC<AdminPortalProps> = (props) => {
  const { auditors, setAuditors, workflows, setWorkflows, audits, onUpdateAudit } = props;
  const [activeTab, setActiveTab] = useState<'clients' | 'audit_records' | 'workflow' | 'auditors_management' | 'forms_manager' | 'knowledge_base' | 'actions' | 'settings'>('clients');
  
  // Forms Manager State
  const [customForms, setCustomForms] = useLocalStorage<FormTemplate[]>('custom-forms', []);
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [previewFormId, setPreviewFormId] = useState<string | null>(null);

  // Add Auditor State
  const [newAuditorName, setNewAuditorName] = useState('');
  const [newAuditorEmail, setNewAuditorEmail] = useState('');
  const [newAuditorPhoto, setNewAuditorPhoto] = useState<string | undefined>(undefined);
  const [newAuditorPhotoName, setNewAuditorPhotoName] = useState<string>('');
  const [newAuditorApprovedCodes, setNewAuditorApprovedCodes] = useState<string[]>([]);

  // Modal States
  const [auditorToEdit, setAuditorToEdit] = useState<{ originalName: string, data: Auditor } | null>(null);
  const [auditorToDelete, setAuditorToDelete] = useState<Auditor | null>(null);

  // Settings State
  const currentUser = auditors[0]; // Simulating Super Admin as first user
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profileSignature, setProfileSignature] = useState(currentUser?.signature || '');

  const pendingActionCount = useMemo(() => {
      let count = 0;
      audits.forEach(audit => {
          (audit.actionItems || []).forEach(action => {
              if ((action.senderRole === 'Super Admin' || action.senderRole === 'administrator') && action.status === 'In Review') {
                  count++;
              }
          });
      });
      return count;
  }, [audits]);
  
  // Stats Calculation
  const clientStats = useMemo(() => {
      const total = audits.length;
      
      const inactiveStatuses = [ClientStatus.Suspended, ClientStatus.Revoked, ClientStatus.Withdrawn];
      const activeCount = audits.filter(a => !inactiveStatuses.includes(a.status)).length;
      const inactiveCount = total - activeCount;

      const iasAccredited = audits.filter(a => a.iafCodes && a.iafCodes.length > 0).length;
      const gcsCertified = total - iasAccredited;

      const countryMap: Record<string, number> = {};
      audits.forEach(a => {
          // Try to parse country from last part of address
          const parts = a.clientAddress.split(',');
          let country = parts[parts.length - 1].trim();
          // Very basic normalization for demo purposes. In production, use a real address parser or country field.
          if (country.length < 2 || /\d/.test(country)) country = 'USA'; // Fallback if it looks like a zip code
          if (country.toUpperCase() === 'US' || country.toUpperCase() === 'UNITED STATES') country = 'USA';
          
          countryMap[country] = (countryMap[country] || 0) + 1;
      });

      const topCountries = Object.entries(countryMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4);

      return {
          total,
          activeCount,
          inactiveCount,
          iasAccredited,
          gcsCertified,
          topCountries
      };
  }, [audits]);

  const handleAuditorPhotoChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isEdit && auditorToEdit) {
             setAuditorToEdit(prev => prev ? ({ ...prev, data: { ...prev.data, photo: result } }) : null);
        } else {
             setNewAuditorPhoto(result);
             setNewAuditorPhotoName(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCodeToggle = (code: string, isEdit: boolean = false) => {
      if (isEdit && auditorToEdit) {
          const currentCodes = auditorToEdit.data.approvedCodes || [];
          const updatedCodes = currentCodes.includes(code)
            ? currentCodes.filter(c => c !== code)
            : [...currentCodes, code];
          setAuditorToEdit({ ...auditorToEdit, data: { ...auditorToEdit.data, approvedCodes: updatedCodes } });
      } else {
          setNewAuditorApprovedCodes(prev => 
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
          );
      }
  };

  const handleAddAuditor = () => {
    const name = newAuditorName.trim();
    const email = newAuditorEmail.trim();

    if (name && email && !auditors.some(a => a.name.toLowerCase() === name.toLowerCase())) {
      setAuditors(prev => [...prev, { 
          name, 
          email, 
          photo: newAuditorPhoto,
          approvedCodes: newAuditorApprovedCodes
      }]);
      setNewAuditorName('');
      setNewAuditorEmail('');
      setNewAuditorPhoto(undefined);
      setNewAuditorPhotoName('');
      setNewAuditorApprovedCodes([]);
    } else {
        alert('Please provide a unique name and a valid email.');
    }
  };

  const initiateDeleteAuditor = (auditor: Auditor) => {
      setAuditorToDelete(auditor);
  };

  const confirmDeleteAuditor = () => {
    if (!auditorToDelete) return;
    
    const activeAudits = audits || [];
    if (activeAudits.some(audit => audit.assignedAuditor === auditorToDelete.name)) {
        alert(`Cannot remove ${auditorToDelete.name}. They are assigned to one or more active audits. Please reassign the audits first.`);
        setAuditorToDelete(null);
        return;
    }
    
    setAuditors(prev => prev.filter(auditor => auditor.name !== auditorToDelete.name));
    setAuditorToDelete(null);
  };

  const initiateEditAuditor = (auditor: Auditor) => {
      setAuditorToEdit({ originalName: auditor.name, data: { ...auditor } });
  };

  const saveEditedAuditor = () => {
      if (!auditorToEdit) return;
      
      const { originalName, data: newData } = auditorToEdit;
      
      if (newData.name !== originalName && auditors.some(a => a.name.toLowerCase() === newData.name.toLowerCase() && a.name !== originalName)) {
          alert('An auditor with this name already exists.');
          return;
      }

      setAuditors(prev => prev.map(a => a.name === originalName ? newData : a));

      if (originalName !== newData.name) {
          const activeAudits = audits || [];
          activeAudits.forEach(audit => {
              if (audit.assignedAuditor === originalName) {
                  onUpdateAudit({ ...audit, assignedAuditor: newData.name });
              }
          });
      }

      setAuditorToEdit(null);
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

  const handleSaveForm = (form: FormTemplate) => {
      if (editingFormId) {
          setCustomForms(prev => prev.map(f => f.id === editingFormId ? form : f));
          setEditingFormId(null);
      } else {
          setCustomForms(prev => [...prev, form]);
      }
      setIsFormBuilderOpen(false);
  };

  const handleEditForm = (formId: string) => {
      setEditingFormId(formId);
      setIsFormBuilderOpen(true);
  };

  const handlePreviewForm = (formId: string) => {
      setPreviewFormId(formId);
      setIsFormBuilderOpen(true);
  };

  const handleDeleteForm = (formId: string) => {
      if (window.confirm('Are you sure you want to delete this form?')) {
          setCustomForms(prev => prev.filter(f => f.id !== formId));
      }
  };
  
  const handleDownloadForm = (form: FormTemplate) => {
      if (form.backgroundDataUrl) {
          const link = document.createElement('a');
          link.href = form.backgroundDataUrl;
          const extension = form.backgroundType === 'pdf' ? 'pdf' : 'png';
          link.download = `${form.title.replace(/\s+/g, '_')}_background.${extension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } else {
          alert('This form does not have a background file to download.');
      }
  };

  const sections = [
      { id: 'clients', title: 'Dashboard', icon: <LayoutGridIcon /> },
      { id: 'audit_records', title: 'Audit Records', icon: <ArchiveIcon /> },
      { id: 'workflow', title: 'Portal Workflow', icon: <GitMergeIcon /> },
      { id: 'knowledge_base', title: 'Knowledge Base', icon: <BookOpenIcon /> },
      { id: 'auditors_management', title: 'Manage Auditors', icon: <UsersIcon /> },
      { id: 'forms_manager', title: 'Forms Manager', icon: <FileTextIcon /> },
      { id: 'actions', title: 'Admin Request', icon: <ClipboardListIcon /> },
      { id: 'settings', title: 'Settings', icon: <SettingsIcon /> },
  ];

  if (isFormBuilderOpen) {
      const formToEdit = customForms.find(f => f.id === (editingFormId || previewFormId));
      return (
          <FormBuilder 
              onSave={handleSaveForm} 
              onCancel={() => { setIsFormBuilderOpen(false); setEditingFormId(null); setPreviewFormId(null); }} 
              existingForm={formToEdit}
              initialPreview={!!previewFormId}
          />
      );
  }

  const renderMainContent = () => {
      if (activeTab === 'clients') {
          return (
            <div className="space-y-6">
                {/* High Level Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Clients */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-4 z-10 relative">
                             <div className="p-3 bg-brand-secondary rounded-lg text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                <LayoutGridIcon />
                            </div>
                            <p className="text-text-primary font-bold text-base">Total Clients</p>
                        </div>
                        
                        <div className="space-y-2 z-10 relative">
                             <h3 className="text-4xl font-bold text-text-primary mt-2 group-hover:text-brand-primary transition-colors">{clientStats.total}</h3>
                             <div className="flex items-center gap-2">
                                 <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                                    <span className="text-[10px]">▲</span>
                                    {audits.filter(a => new Date(a.createdAt).getMonth() === new Date().getMonth()).length} New
                                 </span>
                                 <span className="text-xs text-text-secondary">this month</span>
                            </div>
                        </div>
                         {/* Decorative bg shape */}
                        <div className="absolute -bottom-4 -right-4 text-gray-50 opacity-50 transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                            <svg width="100" height="100" fill="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        </div>
                    </div>

                    {/* Top Countries */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                         <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <GlobeIcon />
                            </div>
                            <p className="text-text-primary font-bold text-base">Top Regions</p>
                         </div>
                         <div className="space-y-3">
                             {clientStats.topCountries.map(([country, count]) => (
                                 <div key={country} className="flex items-center justify-between text-sm">
                                     <span className="text-text-secondary font-medium">{country}</span>
                                     <div className="flex items-center gap-3 w-2/3">
                                         <div className="h-2 bg-gray-100 rounded-full w-full overflow-hidden">
                                             <div className="h-full bg-brand-accent group-hover:bg-brand-primary transition-colors" style={{ width: `${(count / clientStats.total) * 100}%` }}></div>
                                         </div>
                                         <span className="text-xs font-bold text-text-primary w-4 text-right">{count}</span>
                                     </div>
                                 </div>
                             ))}
                             {clientStats.topCountries.length === 0 && <p className="text-xs text-gray-400 italic">No location data available</p>}
                         </div>
                    </div>

                    {/* Account Status */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <UsersIcon />
                            </div>
                            <p className="text-text-primary font-bold text-base">Status</p>
                         </div>
                        <div className="space-y-5 mt-2">
                            <div>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="font-medium text-text-secondary">Active</span>
                                    <span className="font-bold text-text-primary">{clientStats.activeCount}</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 group-hover:bg-green-600 transition-colors" style={{ width: `${clientStats.total ? (clientStats.activeCount / clientStats.total) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="font-medium text-text-secondary">Suspended/Revoked</span>
                                    <span className="font-bold text-text-primary">{clientStats.inactiveCount}</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 group-hover:bg-red-600 transition-colors" style={{ width: `${clientStats.total ? (clientStats.inactiveCount / clientStats.total) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Accreditation Status */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
                         <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <BadgeIcon />
                            </div>
                            <p className="text-text-primary font-bold text-base">Accreditation</p>
                         </div>
                         <div className="flex items-center justify-around mt-2">
                             {/* Simple donut representation using CSS conic gradient */}
                             <div className="w-24 h-24 rounded-full relative shadow-inner" style={{
                                 background: `conic-gradient(#4C9AFF 0% ${(clientStats.iasAccredited / clientStats.total) * 100}%, #E5E7EB ${(clientStats.iasAccredited / clientStats.total) * 100}% 100%)`
                             }}>
                                 <div className="absolute inset-3 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                     <span className="text-2xl font-bold text-text-primary">{clientStats.total}</span>
                                     <span className="text-[10px] text-text-secondary uppercase">Clients</span>
                                 </div>
                             </div>
                             <div className="space-y-3">
                                 <div className="flex items-center gap-2">
                                     <span className="w-3 h-3 bg-brand-accent rounded-full"></span>
                                     <div>
                                        <p className="text-xs font-medium text-text-secondary">IAS Accredited</p>
                                        <p className="text-sm font-bold text-text-primary">{clientStats.iasAccredited}</p>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                     <span className="w-3 h-3 bg-gray-200 rounded-full"></span>
                                     <div>
                                        <p className="text-xs font-medium text-text-secondary">GCS Certified</p>
                                        <p className="text-sm font-bold text-text-primary">{clientStats.gcsCertified}</p>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>

                <ClientManager {...props} />
            </div>
          );
      }
      if (activeTab === 'audit_records') {
          return <AuditRecordsManager audits={props.audits} onUpdateAudit={props.onUpdateAudit} />;
      }
      if (activeTab === 'workflow') {
          return <WorkflowManager workflows={workflows} setWorkflows={setWorkflows} />;
      }
      if (activeTab === 'knowledge_base') {
          return <KnowledgeBaseManager videos={props.knowledgeBaseVideos} setVideos={props.setKnowledgeBaseVideos} documents={props.knowledgeBaseDocuments} setDocuments={props.setKnowledgeBaseDocuments} />;
      }
      if (activeTab === 'forms_manager') {
          return (
              <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold text-text-primary">Forms Manager</h3>
                      <button 
                        onClick={() => { setEditingFormId(null); setIsFormBuilderOpen(true); }}
                        className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-brand-accent transition-colors flex items-center gap-2"
                      >
                           <PlusIcon /> Create New Form
                      </button>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                      <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                          <FileTextIcon /> Custom Forms
                      </h4>
                       <p className="text-sm text-text-secondary mb-4">Manage and distribute your custom forms.</p>
                       {customForms.length > 0 ? (
                           <ul className="space-y-2">
                               {customForms.map(form => (
                                   <li key={form.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-text-primary">{form.title}</span>
                                            <span className="text-xs text-text-secondary">{form.description}</span>
                                        </div>
                                       <div className="flex items-center gap-2">
                                           <button onClick={() => handlePreviewForm(form.id)} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded text-xs font-medium flex items-center gap-1" title="Preview Form">
                                               <EyeIcon /> Preview
                                           </button>
                                           <button onClick={() => handleDownloadForm(form)} className="p-1.5 text-green-600 hover:bg-green-100 rounded text-xs font-medium flex items-center gap-1" title="Download Background">
                                               <DownloadIcon /> Download
                                           </button>
                                           <button onClick={() => handleEditForm(form.id)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium flex items-center gap-1" title="Edit Form">
                                               <EditIcon/> Edit
                                           </button>
                                           <button onClick={() => handleDeleteForm(form.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded text-xs font-medium flex items-center gap-1" title="Delete Form">
                                               <TrashIcon/> Delete
                                           </button>
                                       </div>
                                   </li>
                               ))}
                           </ul>
                       ) : (
                           <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
                              <p className="text-sm text-gray-500">No custom forms available.</p>
                              <button onClick={() => { setEditingFormId(null); setIsFormBuilderOpen(true); }} className="mt-2 text-sm text-brand-primary font-semibold hover:underline">Create one now</button>
                           </div>
                       )}
                  </div>
              </div>
          );
      }
      if (activeTab === 'actions') {
          return (
              <ActionManager 
                  audits={audits} 
                  onUpdateAudit={onUpdateAudit} 
                  currentUser={currentUser} 
                  userRole="administrator" 
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
          )
      }
      if (activeTab === 'auditors_management') {
          return (
            <div className="max-w-4xl mx-auto">
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Manage Auditors</h3>
                    <div className="space-y-3 mb-8 pb-8 border-b">
                        <h4 className="font-medium text-text-secondary">Add New Auditor</h4>
                        <input type="text" value={newAuditorName} onChange={(e) => setNewAuditorName(e.target.value)} className="w-full input-field" placeholder="Auditor Name" />
                        <input type="email" value={newAuditorEmail} onChange={(e) => setNewAuditorEmail(e.target.value)} className="w-full input-field" placeholder="Auditor Email" />
                        
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Approved Codes</label>
                            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                                {AUDITOR_APPROVAL_CODES.map(code => (
                                    <label key={code} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newAuditorApprovedCodes.includes(code)}
                                            onChange={() => handleCodeToggle(code)}
                                            className="rounded border-gray-300 text-brand-primary focus:ring-brand-accent h-4 w-4"
                                        />
                                        <span className="text-sm text-gray-700">{code}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="w-full block text-left cursor-pointer bg-brand-secondary hover:bg-gray-200 text-text-primary font-semibold py-2 px-3 rounded-md text-sm transition-colors">
                                Upload Profile Picture
                                <input type="file" accept="image/*" onChange={(e) => handleAuditorPhotoChange(e)} className="hidden" />
                            </label>
                            {newAuditorPhotoName && <p className="text-xs text-left text-text-secondary mt-1 pl-1">{newAuditorPhotoName}</p>}
                        </div>

                        <button onClick={handleAddAuditor} className="w-full bg-brand-primary text-white font-bold py-2 px-3 rounded-md hover:bg-brand-accent transition-colors mt-2">
                            Add Auditor
                        </button>
                    </div>

                    <h4 className="font-medium text-text-secondary mb-3">Existing Auditors</h4>
                    <ul className="mt-2 space-y-2 max-h-80 overflow-y-auto">
                        {auditors.map(auditor => (
                            <li key={auditor.name} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-100">
                                <div className="flex items-center gap-3">
                                    {auditor.photo ? (
                                        <img src={auditor.photo} alt={auditor.name} className="h-10 w-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                            {auditor.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-text-primary text-sm font-semibold">{auditor.name}</p>
                                        <p className="text-text-secondary text-xs">{auditor.email}</p>
                                        {auditor.approvedCodes && auditor.approvedCodes.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {auditor.approvedCodes.map(code => (
                                                    <span key={code} className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full border border-blue-200">
                                                        {code}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => initiateEditAuditor(auditor)} className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors" aria-label={`Edit ${auditor.name}`}>
                                        <EditIcon />
                                    </button>
                                    <button onClick={() => initiateDeleteAuditor(auditor)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors" aria-label={`Remove ${auditor.name}`}>
                                        <TrashIcon />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
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
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded border border-purple-200 uppercase tracking-wider">
                    Super Admin
                </span>
            </div>
        </div>
      
        <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Sidebar Menu */}
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
        
        {/* Edit Auditor Modal */}
        {auditorToEdit && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h3 className="text-xl font-bold text-text-primary">Edit Auditor</h3>
                        <button onClick={() => setAuditorToEdit(null)} className="text-gray-500 hover:text-gray-700"><XIcon /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                            <input 
                                type="text" 
                                value={auditorToEdit.data.name} 
                                onChange={(e) => setAuditorToEdit({ ...auditorToEdit, data: { ...auditorToEdit.data, name: e.target.value } })} 
                                className="w-full input-field" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                            <input 
                                type="email" 
                                value={auditorToEdit.data.email} 
                                onChange={(e) => setAuditorToEdit({ ...auditorToEdit, data: { ...auditorToEdit.data, email: e.target.value } })} 
                                className="w-full input-field" 
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Approved Codes</label>
                            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                                {AUDITOR_APPROVAL_CODES.map(code => (
                                    <label key={code} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={(auditorToEdit.data.approvedCodes || []).includes(code)}
                                            onChange={() => handleCodeToggle(code, true)}
                                            className="rounded border-gray-300 text-brand-primary focus:ring-brand-accent h-4 w-4"
                                        />
                                        <span className="text-sm text-gray-700">{code}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Photo</label>
                            <div className="flex items-center gap-4">
                                {auditorToEdit.data.photo ? (
                                    <img src={auditorToEdit.data.photo} alt="Preview" className="h-12 w-12 rounded-full object-cover border" />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">{auditorToEdit.data.name.charAt(0)}</div>
                                )}
                                <label className="cursor-pointer bg-brand-secondary hover:bg-gray-200 text-text-primary font-semibold py-2 px-3 rounded-md text-xs transition-colors">
                                    Change Photo
                                    <input type="file" accept="image/*" onChange={(e) => handleAuditorPhotoChange(e, true)} className="hidden" />
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <button onClick={() => setAuditorToEdit(null)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button onClick={saveEditedAuditor} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-accent">Save Changes</button>
                    </div>
                </div>
            </div>
        )}

        {/* Delete Confirmation Modal */}
        {auditorToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                    <h3 className="text-lg font-bold text-red-600 mb-2">Confirm Deletion</h3>
                    <p className="text-text-secondary mb-6">
                        Are you sure you want to delete auditor <strong>{auditorToDelete.name}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setAuditorToDelete(null)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="button" onClick={confirmDeleteAuditor} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Delete</button>
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

export default AdminPortal;
