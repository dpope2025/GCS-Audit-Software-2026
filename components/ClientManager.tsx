
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Audit, Auditor, AuditorStatus, AuditStage, Workflow, ClientStatus, UserRole, AuditorDocument } from '../types';
import { ISOStandardID } from '../constants';
import ProgressBar from './ProgressBar';
import { ISO_STANDARDS, ALL_AUDIT_STAGES, CLIENT_STATUS_CONFIG, IAF_CODES } from '../constants';

// Inlined SVGs
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const FileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;


interface ClientManagerProps {
  audits: Audit[];
  auditors: Auditor[];
  workflows: Workflow[];
  onSelectAudit: (auditId: string) => void;
  onCreateAudit: (audit: Audit) => void;
  onUpdateAudit: (audit: Audit) => void;
  onDeleteAudit: (auditId: string) => void;
  userRole: UserRole;
}

const CLIENTS_PER_PAGE = 6;

const GCS_TRIGGER_CODES = ['1', '2', '3', '4', '5', '6', '11', '23', '24', '25', '26', '27', '30', '31', '38', '39'];

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

const PaginatedClientTable: React.FC<{
  title: string;
  list: Audit[];
  onSelectAudit: (auditId: string) => void;
  calculateProgress: (audit: Audit) => number;
  setEditingAudit: (audit: Audit) => void;
  setDeletingAudit: (audit: Audit) => void;
  setViewingClientInfo: (audit: Audit) => void;
}> = ({ title, list, onSelectAudit, calculateProgress, setEditingAudit, setDeletingAudit, setViewingClientInfo }) => {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [list]);

    const indexOfLastClient = currentPage * CLIENTS_PER_PAGE;
    const indexOfFirstClient = indexOfLastClient - CLIENTS_PER_PAGE;
    const currentClients = list.slice(indexOfFirstClient, indexOfLastClient);
    const totalPages = Math.ceil(list.length / CLIENTS_PER_PAGE);

    const paginate = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    const getDueDateClass = (dueDate: string): string => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);

        const diff = due.getTime() - now.getTime();

        if (diff < 0) return 'text-gray-500';

        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const oneMonth = 30 * 24 * 60 * 60 * 1000;
        const threeMonths = 90 * 24 * 60 * 60 * 1000;
        
        const baseClass = 'px-2 py-1 rounded-md inline-block';

        if (diff <= oneWeek) {
            return `bg-red-100 text-red-800 font-semibold ${baseClass}`;
        }
        if (diff <= oneMonth) {
            return `bg-orange-200 text-orange-800 font-semibold ${baseClass}`;
        }
        if (diff <= threeMonths) {
            return `bg-orange-100 text-orange-700 ${baseClass}`;
        }
        
        return 'text-text-secondary';
    };
    
    return (
        <div>
            <h3 className="text-xl font-semibold text-text-primary mb-4">{title} ({list.length})</h3>
            {list.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Client</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Auditor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Due Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider min-w-[120px]">Progress</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentClients.map(audit => (
                                <tr key={audit.id} onClick={() => onSelectAudit(audit.id)} className="hover:bg-gray-50 cursor-pointer transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {audit.clientLogo ? 
                                                <img src={audit.clientLogo} alt="Logo" className="h-8 w-8 object-contain rounded-full border mr-3 flex-shrink-0" />
                                                : <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm mr-3 flex-shrink-0">{audit.clientName.charAt(0)}</div>
                                            }
                                            <div>
                                                <div className="text-sm font-medium text-text-primary">{audit.clientName}</div>
                                                <div className="text-xs text-text-secondary">{audit.standardId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                        {audit.assignedAuditors && audit.assignedAuditors.length > 0 
                                            ? audit.assignedAuditors.join(', ') 
                                            : audit.assignedAuditor}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={getDueDateClass(audit.dueDate)}>
                                            {formatDate(audit.dueDate)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${CLIENT_STATUS_CONFIG[audit.status]?.colors || 'bg-gray-100 text-gray-800'}`}>
                                            {CLIENT_STATUS_CONFIG[audit.status]?.label || audit.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ProgressBar progress={calculateProgress(audit)} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); setViewingClientInfo(audit); }} className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"><InfoIcon /> Info</button>
                                            <button onClick={(e) => { e.stopPropagation(); setEditingAudit(audit); }} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-md transition-colors"><EditIcon /> Edit</button>
                                            <button onClick={(e) => { e.stopPropagation(); setDeletingAudit(audit); }} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-md transition-colors"><TrashIcon /> Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6" aria-label="Pagination">
                            <div className="hidden sm:block">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{indexOfFirstClient + 1}</span> to <span className="font-medium">{Math.min(indexOfLastClient, list.length)}</span> of <span className="font-medium">{list.length}</span> results
                                </p>
                            </div>
                            <div className="flex-1 flex justify-between sm:justify-end">
                                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
                                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
                            </div>
                        </nav>
                    )}
                </div>
            ) : <p className="text-text-secondary italic bg-white p-6 rounded-lg shadow-md text-center">No clients match the current criteria.</p>}
        </div>
    );
};

const ClientManager: React.FC<ClientManagerProps> = ({ audits, auditors, workflows, onSelectAudit, onCreateAudit, onUpdateAudit, onDeleteAudit, userRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null);
  const [deletingAudit, setDeletingAudit] = useState<Audit | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [viewingClientInfo, setViewingClientInfo] = useState<Audit | null>(null);

  const initialFormState: Omit<Audit, 'id' | 'createdAt' | 'statuses' | 'customClauses' | 'assignedAuditors' | 'standards' | 'accreditationType'> & { id?: string } = {
    clientName: '', clientAddress: '', clientLogo: undefined, clientRepName: '', clientRepEmail: '', clientRepTitle: '',
    assignedAuditor: auditors[0]?.name || '', // Fallback default
    dueDate: '', standardId: ISOStandardID.ISO9001, currentStage: AuditStage.Stage1, status: ClientStatus.InProgress,
    scope: '', iafCodes: [], certificateNumber: '',
  };

  const [formState, setFormState] = useState(initialFormState);
  const [logoFileName, setLogoFileName] = useState<string>('');
  
  // New state for multi-selects and uploads
  const [selectedAssignedAuditors, setSelectedAssignedAuditors] = useState<string[]>([]);
  const [selectedIafCodes, setSelectedIafCodes] = useState<string[]>([]);
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [selectedAccreditation, setSelectedAccreditation] = useState<'IAS' | 'GCS' | undefined>('IAS');
  const [applicationForms, setApplicationForms] = useState<File[]>([]);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openModal = (auditToEdit: Audit | null) => {
    setEditingAudit(auditToEdit);
    if (auditToEdit) {
      setFormState({
        ...auditToEdit,
        dueDate: auditToEdit.dueDate.split('T')[0] // Format for date input
      });
      setLogoFileName(''); // Don't show old filename when editing
      setSelectedIafCodes(auditToEdit.iafCodes || []);
      setSelectedAssignedAuditors(auditToEdit.assignedAuditors || (auditToEdit.assignedAuditor ? [auditToEdit.assignedAuditor] : []));
      setSelectedStandards(auditToEdit.standards || [auditToEdit.standardId]);
      setSelectedAccreditation(auditToEdit.accreditationType);
    } else {
      setFormState(initialFormState);
      setLogoFileName('');
      setSelectedIafCodes([]);
      setSelectedAssignedAuditors([]);
      setSelectedStandards([ISOStandardID.ISO9001]);
      setSelectedAccreditation('IAS'); // Default to IAS
      setApplicationForms([]);
    }
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAudit(null);
    setFormState(initialFormState);
    setLogoFileName('');
    setSelectedIafCodes([]);
    setSelectedAssignedAuditors([]);
    setSelectedStandards([]);
    setSelectedAccreditation('IAS');
    setApplicationForms([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState(prev => ({ ...prev, clientLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplicationFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
          const newFiles = Array.from(files);
          setApplicationForms(prev => [...prev, ...newFiles]);
      }
      
      // Reset the input value to allow selecting the same file again if needed
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const handleMultiCheckboxChange = (
      item: string, 
      currentList: string[], 
      setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
      if (currentList.includes(item)) {
          setList(currentList.filter(i => i !== item));
      } else {
          setList([...currentList, item]);
      }
  };

  const handleIafCodeChange = (code: string) => {
      let newCodes: string[];
      if (selectedIafCodes.includes(code)) {
          newCodes = selectedIafCodes.filter(c => c !== code);
      } else {
          newCodes = [...selectedIafCodes, code];
      }
      setSelectedIafCodes(newCodes);

      // Check against trigger codes for auto-selection of Accreditation
      const hasTriggerCode = newCodes.some(c => GCS_TRIGGER_CODES.includes(c));
      if (hasTriggerCode) {
          setSelectedAccreditation('GCS');
      } else {
          setSelectedAccreditation('IAS');
      }
  };

  const handleRemoveApplicationFile = (index: number) => {
      setApplicationForms(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determine primary standard (fallback to first selected or default)
    const primaryStandard = selectedStandards.length > 0 ? selectedStandards[0] as ISOStandardID : formState.standardId;
    // Determine primary auditor (fallback to first selected)
    const primaryAuditor = selectedAssignedAuditors.length > 0 ? selectedAssignedAuditors[0] : formState.assignedAuditor;

    let finalFormState = {
        ...formState, 
        iafCodes: selectedIafCodes,
        assignedAuditors: selectedAssignedAuditors,
        standards: selectedStandards,
        accreditationType: selectedAccreditation,
        standardId: primaryStandard,
        assignedAuditor: primaryAuditor
    };

    // Process Uploaded Application Forms
    let newDocs: AuditorDocument[] = [];
    if (applicationForms.length > 0) {
        const filePromises = applicationForms.map(file => {
            return new Promise<AuditorDocument>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve({
                    id: crypto.randomUUID(),
                    name: `Application Form - ${file.name}`,
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
            newDocs = await Promise.all(filePromises);
        } catch(err) {
            console.error("Error reading application files", err);
            alert("Failed to process uploaded application forms.");
            return;
        }
    }

    if (editingAudit) {
      const existingStageDocs = editingAudit.stageDocuments || [];
      let updatedStageDocs = [...existingStageDocs];

      if (newDocs.length > 0) {
         // Add to Stage 1 documents by default for application forms
         const stage1Index = updatedStageDocs.findIndex(sd => sd.stage === AuditStage.Stage1);
         if (stage1Index >= 0) {
             updatedStageDocs[stage1Index].documents = [...updatedStageDocs[stage1Index].documents, ...newDocs];
         } else {
             updatedStageDocs.push({ stage: AuditStage.Stage1, documents: newDocs });
         }
      }

      const updatedAudit: Audit = {
        ...editingAudit,
        ...finalFormState,
        dueDate: new Date(finalFormState.dueDate).toISOString(),
        stageDocuments: updatedStageDocs
      };
      onUpdateAudit(updatedAudit);
    } else {
      const workflow = workflows.find(w => w.id === primaryStandard);
      const stage = workflow?.stages.find(s => s.stage === finalFormState.currentStage);
      const initialStatuses = stage?.clauses.map(clause => ({
        clauseId: clause.id,
        notes: '',
        findings: '',
        uploadedFiles: [],
        auditorStatus: AuditorStatus.NotStarted,
      })) || [];

      const stageDocuments = newDocs.length > 0 ? [{ stage: AuditStage.Stage1, documents: newDocs }] : [];

      const newAudit: Audit = {
        ...finalFormState,
        id: `audit-${crypto.randomUUID()}`,
        createdAt: new Date().toISOString(),
        dueDate: new Date(finalFormState.dueDate).toISOString(),
        statuses: initialStatuses,
        customClauses: [],
        stageDocuments: stageDocuments
      };
      onCreateAudit(newAudit);
    }
    closeModal();
  };

  const handleResetAudit = () => {
    if (!editingAudit) return;
    const workflow = workflows.find(w => w.id === editingAudit.standardId);
    const stage = workflow?.stages.find(s => s.stage === editingAudit.currentStage);
    const statuses = stage?.clauses.map(clause => ({
        clauseId: clause.id,
        notes: '',
        findings: '',
        uploadedFiles: [],
        auditorStatus: AuditorStatus.NotStarted,
    })) || [];
    
    const resetAudit: Audit = {
        ...editingAudit,
        statuses,
        meetings: [],
        generalNotes: [],
        customClauses: [],
        auditorDocuments: [],
        stageDocuments: [],
        technicalReviewDocuments: [],
        auditorRecommendation: undefined,
        auditorSubRecommendation: undefined,
        certificationDecisionData: undefined,
    };
    onUpdateAudit(resetAudit);
    alert('Audit progress, meetings, and documents have been reset.');
    setIsResetConfirmOpen(false);
    closeModal();
  };

  const calculateProgress = (audit: Audit) => {
      const workflow = workflows.find(w => w.id === audit.standardId);
      const stage = workflow?.stages.find(s => s.stage === audit.currentStage);
      const totalClauses = (stage?.clauses?.length || 0) + (audit.customClauses?.length || 0);

      if (totalClauses === 0) return 0;
      
      const completedStatuses = [
          AuditorStatus.Accepted,
          AuditorStatus.MinorNC,
          AuditorStatus.MajorNC,
      ];
      const completedCount = audit.statuses.filter(s => completedStatuses.includes(s.auditorStatus)).length;
      return (completedCount / totalClauses) * 100;
  };
  
  const { inProgress, pendingReview, requiresAction, valid, archived } = useMemo(() => {
    const lists: { inProgress: Audit[], pendingReview: Audit[], requiresAction: Audit[], valid: Audit[], archived: Audit[] } = { inProgress: [], pendingReview: [], requiresAction: [], valid: [], archived: [] };
    const filtered = audits.filter(a =>
      a.clientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === 'all' || a.status === statusFilter)
    );

    filtered.forEach(audit => {
      switch (audit.status) {
        case ClientStatus.InProgress:
        case ClientStatus.CorrectiveActionPendingReview:
        case ClientStatus.CorrectiveActionApproved:
          lists.inProgress.push(audit);
          break;
        case ClientStatus.PendingTechnicalReview:
          lists.pendingReview.push(audit);
          break;
        case ClientStatus.ActionRequired:
          lists.requiresAction.push(audit);
          break;
        case ClientStatus.Valid:
          lists.valid.push(audit);
          break;
        case ClientStatus.Suspended:
        case ClientStatus.Revoked:
        case ClientStatus.Withdrawn:
          lists.archived.push(audit);
          break;
      }
    });
    return lists;
  }, [audits, searchTerm, statusFilter]);

  const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-text-secondary">{label}</dt>
        <dd className="mt-1 text-base text-text-primary">{value || '-'}</dd>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-md">
        <div className="flex-grow flex items-center gap-4">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-xs input-field text-base"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ClientStatus | 'all')}
            className="input-field h-full text-base"
          >
            <option value="all">All Statuses</option>
            {Object.entries(CLIENT_STATUS_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => openModal(null)}
          className="bg-brand-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:bg-brand-accent transition-colors text-base"
        >
          + Add New Client
        </button>
      </div>

      <div className="space-y-8">
        {requiresAction.length > 0 && <PaginatedClientTable title="Action Required" list={requiresAction} onSelectAudit={onSelectAudit} calculateProgress={calculateProgress} setEditingAudit={openModal} setDeletingAudit={setDeletingAudit} setViewingClientInfo={setViewingClientInfo} />}
        {pendingReview.length > 0 && <PaginatedClientTable title="Pending Technical Review" list={pendingReview} onSelectAudit={onSelectAudit} calculateProgress={calculateProgress} setEditingAudit={openModal} setDeletingAudit={setDeletingAudit} setViewingClientInfo={setViewingClientInfo} />}
        {inProgress.length > 0 && <PaginatedClientTable title="In Progress" list={inProgress} onSelectAudit={onSelectAudit} calculateProgress={calculateProgress} setEditingAudit={openModal} setDeletingAudit={setDeletingAudit} setViewingClientInfo={setViewingClientInfo} />}
        {valid.length > 0 && <PaginatedClientTable title="Valid / Certified" list={valid} onSelectAudit={onSelectAudit} calculateProgress={calculateProgress} setEditingAudit={openModal} setDeletingAudit={setDeletingAudit} setViewingClientInfo={setViewingClientInfo} />}
        {archived.length > 0 && <PaginatedClientTable title="Archived / Inactive" list={archived} onSelectAudit={onSelectAudit} calculateProgress={calculateProgress} setEditingAudit={openModal} setDeletingAudit={setDeletingAudit} setViewingClientInfo={setViewingClientInfo} />}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <h3 className="text-2xl font-bold text-text-primary mb-6 border-b pb-4 flex-shrink-0">{editingAudit ? 'Edit Client Audit' : 'Add New Client'}</h3>
            <form onSubmit={handleSubmit} className="overflow-y-auto pr-4 -mr-4 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Client Details */}
                  <div className="md:col-span-1 space-y-4">
                      <h4 className="text-lg font-semibold text-text-secondary border-b pb-2">Client Details</h4>
                      <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Client Name*</label>
                          <input type="text" name="clientName" value={formState.clientName} onChange={handleChange} className="w-full input-field" required />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Client Address</label>
                          <textarea name="clientAddress" value={formState.clientAddress} onChange={handleChange} rows={2} className="w-full input-field" />
                      </div>
                       <div>
                          <label className="w-full block text-left cursor-pointer bg-brand-secondary hover:bg-gray-200 text-text-primary font-semibold py-2 px-3 rounded-md text-sm transition-colors">
                              {logoFileName || "Upload Client Logo"}
                              <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                          </label>
                      </div>
                      <h4 className="text-lg font-semibold text-text-secondary border-b pb-2 pt-4">Client Representative</h4>
                      <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Rep Name</label>
                          <input type="text" name="clientRepName" value={formState.clientRepName} onChange={handleChange} className="w-full input-field" />
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Rep Email</label>
                          <input type="email" name="clientRepEmail" value={formState.clientRepEmail} onChange={handleChange} className="w-full input-field" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Rep Title</label>
                          <input type="text" name="clientRepTitle" value={formState.clientRepTitle} onChange={handleChange} className="w-full input-field" />
                      </div>
                  </div>
                  {/* Audit Details */}
                  <div className="md:col-span-1 space-y-4">
                      <h4 className="text-lg font-semibold text-text-secondary border-b pb-2">Audit Details</h4>
                       <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Assigned Auditors*</label>
                          <div className="max-h-32 overflow-y-auto border rounded-md p-2 bg-gray-50">
                                {auditors.map(a => (
                                    <label key={a.name} className="flex items-center space-x-2 mb-1 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedAssignedAuditors.includes(a.name)}
                                            onChange={() => handleMultiCheckboxChange(a.name, selectedAssignedAuditors, setSelectedAssignedAuditors)}
                                            className="rounded border-gray-300 text-brand-primary focus:ring-brand-accent"
                                        />
                                        <span className="text-sm">{a.name}</span>
                                    </label>
                                ))}
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Due Date*</label>
                          <input type="date" name="dueDate" value={formState.dueDate} onChange={handleChange} className="w-full input-field" required />
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Standards*</label>
                          <div className="max-h-32 overflow-y-auto border rounded-md p-2 bg-gray-50">
                                {ISO_STANDARDS.map(std => (
                                    <label key={std.id} className="flex items-center space-x-2 mb-1 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedStandards.includes(std.id)}
                                            onChange={() => handleMultiCheckboxChange(std.id, selectedStandards, setSelectedStandards)}
                                            className="rounded border-gray-300 text-brand-primary focus:ring-brand-accent"
                                        />
                                        <span className="text-sm">{std.name}</span>
                                    </label>
                                ))}
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Audit Cycle Stage*</label>
                          <select name="currentStage" value={formState.currentStage} onChange={handleChange} className="w-full input-field" required>
                              {ALL_AUDIT_STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                          </select>
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Initial Client Status*</label>
                           <select name="status" value={formState.status} onChange={handleChange} className="w-full input-field" required>
                              {Object.entries(CLIENT_STATUS_CONFIG).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                          </select>
                      </div>
                      <h4 className="text-lg font-semibold text-text-secondary border-b pb-2 pt-4">Certification Details</h4>
                       <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Certificate Number</label>
                          <input type="text" name="certificateNumber" value={formState.certificateNumber} onChange={handleChange} className="w-full input-field" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">Scope of Certification</label>
                          <textarea name="scope" value={formState.scope} onChange={handleChange} rows={3} className="w-full input-field" />
                      </div>
                      <div>
                           <label className="block text-sm font-medium text-text-secondary mb-1">IAF Code(s)</label>
                           <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50">
                               {IAF_CODES.map(code => (
                                   <label key={code.code} className="flex items-start space-x-2 mb-1 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                       <input 
                                            type="checkbox" 
                                            checked={selectedIafCodes.includes(code.code)}
                                            onChange={() => handleIafCodeChange(code.code)}
                                            className="mt-1 rounded border-gray-300 text-brand-primary focus:ring-brand-accent"
                                       />
                                       <span className="text-xs">{code.code} - {code.description}</span>
                                   </label>
                               ))}
                           </div>
                           <div className="mt-1 text-sm text-brand-primary font-medium">
                               Selected: {selectedIafCodes.length > 0 ? selectedIafCodes.join(', ') : 'None'}
                           </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-gray-50 rounded-md border">
                          <label className="block text-sm font-semibold text-text-primary mb-2">Accreditation Type</label>
                          <div className="flex gap-4">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                  <input type="radio" name="accreditation" checked={selectedAccreditation === 'IAS'} onChange={() => setSelectedAccreditation('IAS')} className="text-brand-primary focus:ring-brand-accent" />
                                  <span className="text-sm">IAS Accredited</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                  <input type="radio" name="accreditation" checked={selectedAccreditation === 'GCS'} onChange={() => setSelectedAccreditation('GCS')} className="text-brand-primary focus:ring-brand-accent" />
                                  <span className="text-sm">GCS Certified</span>
                              </label>
                          </div>
                      </div>

                      <div className="mt-4">
                         <label className="block text-sm font-semibold text-text-primary mb-2">Approval & Application Forms</label>
                         <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors border-gray-300"
                         >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadIcon />
                                <p className="mb-1 text-xs text-gray-500"><span className="font-semibold">Click to upload</span> forms</p>
                                <p className="text-xs text-gray-400">{applicationForms.length > 0 ? `${applicationForms.length} file(s) staged` : 'Required for creation'}</p>
                            </div>
                            <input 
                                type="file" 
                                multiple 
                                onChange={handleApplicationFilesChange} 
                                className="hidden" 
                                ref={fileInputRef}
                            />
                        </div>
                        {applicationForms.length > 0 && (
                            <ul className="mt-2 space-y-1 text-xs text-gray-600">
                                {applicationForms.map((f, i) => (
                                    <li key={i} className="flex items-center justify-between bg-white p-1.5 rounded border">
                                        <div className="flex items-center gap-1"><FileIcon /> {f.name}</div>
                                        <button type="button" onClick={() => handleRemoveApplicationFile(i)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                                    </li>
                                ))}
                            </ul>
                        )}
                      </div>

                  </div>
              </div>
              <div className="flex justify-between items-center mt-8 pt-4 border-t flex-shrink-0">
                  <div>
                      {editingAudit && (
                          <button type="button" onClick={() => setIsResetConfirmOpen(true)} className="flex items-center gap-2 text-sm font-semibold text-yellow-600 bg-yellow-100 hover:bg-yellow-200 px-4 py-2 rounded-md transition-colors">
                              <AlertTriangleIcon />
                              Reset Audit Progress
                          </button>
                      )}
                  </div>
                  <div className="flex gap-4">
                      <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                      <button 
                        type="submit" 
                        disabled={!editingAudit && applicationForms.length === 0}
                        className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-accent disabled:bg-gray-300 disabled:cursor-not-allowed"
                        title={!editingAudit && applicationForms.length === 0 ? "Upload application forms to enable creation" : ""}
                    >
                          {editingAudit ? 'Save Changes' : 'Create Client'}
                      </button>
                  </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingAudit && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h3 className="text-2xl font-bold mb-4 text-red-600">Confirm Deletion</h3>
                <p className="text-text-secondary mb-6">Are you sure you want to permanently delete the audit for <span className="font-semibold">{deletingAudit.clientName}</span>? <br/><br/> <span className="font-bold">This action cannot be undone.</span></p>
                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={() => setDeletingAudit(null)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                    <button onClick={() => { onDeleteAudit(deletingAudit.id); setDeletingAudit(null); }} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">Confirm Delete</button>
                </div>
            </div>
        </div>
      )}

      {isResetConfirmOpen && editingAudit && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
              <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                  <h3 className="text-2xl font-bold mb-4 text-yellow-600">Confirm Reset</h3>
                  <p className="text-text-secondary mb-6">
                      This will reset all progress, meetings, documents, and custom questions for <span className="font-semibold">{editingAudit.clientName}</span> to the workflow defaults for the stage <span className="font-semibold">{editingAudit.currentStage}</span>.
                      <br/><br/>
                      <span className="font-bold">This is irreversible.</span> Are you sure you want to proceed?
                  </p>
                  <div className="flex justify-end gap-4 mt-8">
                      <button onClick={() => setIsResetConfirmOpen(false)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                      <button onClick={handleResetAudit} className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors">Confirm Reset</button>
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
                        <InfoRow label="Standard(s)" value={viewingClientInfo.standards ? viewingClientInfo.standards.join(', ') : viewingClientInfo.standardId} />
                        <InfoRow label="Accreditation" value={viewingClientInfo.accreditationType} />
                        <div className="md:col-span-2">
                            <InfoRow label="Scope" value={<p className="whitespace-pre-wrap">{viewingClientInfo.scope}</p>} />
                        </div>
                        <InfoRow label="IAF Code(s)" value={viewingClientInfo.iafCodes?.join(', ')} />
                        <InfoRow label="Status" value={<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${CLIENT_STATUS_CONFIG[viewingClientInfo.status]?.colors || ''}`}>{CLIENT_STATUS_CONFIG[viewingClientInfo.status]?.label}</span>} />
                        <InfoRow label="Due Date" value={formatDate(viewingClientInfo.dueDate)} />
                        <InfoRow label="Assigned Auditors" value={viewingClientInfo.assignedAuditors ? viewingClientInfo.assignedAuditors.join(', ') : viewingClientInfo.assignedAuditor} />
                        <InfoRow label="Certificate Number" value={viewingClientInfo.certificateNumber} />
                        <InfoRow label="Client Representative" value={`${viewingClientInfo.clientRepName} (${viewingClientInfo.clientRepTitle})`} />
                        <InfoRow label="Client Rep Email" value={viewingClientInfo.clientRepEmail} />
                    </dl>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={() => setViewingClientInfo(null)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Close</button>
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

export default ClientManager;
