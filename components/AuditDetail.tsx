
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Audit, ClauseStatus, AuditorStatus, UserRole, Auditor, Clause, Meeting, MeetingType, Workflow, AuditStage, ClientStatus, AuditorDocument, AuditorRecommendation, AuditorSubRecommendation, GeneralNote, CertificationDecisionData, SignatureMetadata } from '../types';
import { AUDITOR_STATUS_CONFIG, ALL_AUDIT_STAGES, CLIENT_STATUS_CONFIG } from '../constants';
import CircularProgressBar from './CircularProgressBar';
import ProgressBar from './ProgressBar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Inlined SVGs to avoid extra dependencies
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const Trash2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const GripVerticalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const MessageSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const SpinnerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>;


interface AuditDetailProps {
  audit: Audit & { clauses: Clause[] }; // Combined clauses are passed in
  auditors: Auditor[];
  workflows: Workflow[];
  onUpdate: (audit: Audit) => void;
  onBack: () => void;
  onNavigateToReports: () => void;
  onDelete: (auditId: string) => void;
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

const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day}-${month}-${year} ${time}`;
};

const certQuestions = [
    { key: 'reportFiled', text: 'Audit Report completed accurately and filed', options: ['Yes', 'No'] },
    { key: 'ncReportFiled', text: 'Nonconformity & Corrective Action Report filed', options: ['Yes', 'No', 'N/A'] },
    { key: 'majorNcImplemented', text: 'Major Nonconformity actions implemented within 6 months', options: ['Yes', 'No', 'N/A'] },
    { key: 'minorNcAccepted', text: 'Minor Nonconformities corrective actions reviewed & accepted', options: ['Yes', 'No', 'N/A'] },
    { key: 'appReviewFiled', text: 'Application Review filed', options: ['Yes', 'No', 'N/A'] },
    { key: 'objectiveAchieved', text: 'Confirmed audit\'s objective was achieved', options: ['Yes', 'No'] },
    { key: 'scopeVerified', text: 'SCOPE VERIFIED for listing (Address, List of Services)', options: ['Yes', 'No', 'N/A'] },
];

const generateDecisionReportPdf = (audit: Audit, decisionData: CertificationDecisionData, signingAuditor?: Auditor): { pdfDataUri: string; pdfBlob: Blob } => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxW = pageW - margin * 2;
    let y = margin;

    // --- Title ---
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Certification Decision Report', pageW / 2, y, { align: 'center' });
    y += 15;

    // --- Table ---
    const questionMap = new Map(certQuestions.map(q => [q.key, q.text]));
    const tableHeader = [['QUESTIONS', 'ANSWERS']];
    const tableBody = certQuestions.map(q => {
        const key = q.key as keyof typeof decisionData.answers;
        const answer = decisionData.answers[key];
        const answerText = q.options.map(opt => `${answer === opt ? '☑' : '☐'} ${opt}`).join('   ');
        return [q.text, answerText];
    });

    autoTable(doc, {
        startY: y,
        head: tableHeader,
        body: tableBody,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [230, 230, 230], textColor: 20, fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: maxW * 0.6 }, 1: { cellWidth: maxW * 0.4 } },
        didDrawPage: (data) => {
            y = data.cursor?.y || y;
        }
    });

    y = (doc as any).lastAutoTable.finalY + 10;
    
    // --- Decision Section ---
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, y, maxW, 8, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Certification Decision', pageW / 2, y + 5.5, { align: 'center' });
    y += 8;

    doc.rect(margin, y, maxW, 30, 'S');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const decisionText = 'Based on the information received for assessment & review, and recommendation by the Lead Auditor, on behalf of GCS, the decision to certify is hereby';
    const wrappedText = doc.splitTextToSize(decisionText, maxW - 4);
    doc.text(wrappedText, margin + 2, y + 5);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const grantedText = `${decisionData.decision === 'Granted' ? '☑' : '☐'} GRANTED`;
    const notGrantedText = `${decisionData.decision === 'Not Granted' ? '☑' : '☐'} NOT GRANTED`;
    doc.text(grantedText, margin + 10, y + 20);
    doc.text(notGrantedText, margin + 60, y + 20);
    y += 30;

    // --- Footer Info ---
    y += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Client: ${audit.clientName}`, margin, y);
    doc.text(`Standard: ${audit.standardId}`, margin, y + 5);
    doc.text(`Decision Date: ${formatDate(decisionData.decisionDate)}`, margin, y + 10);
    y += 15;

    // --- Signature ---
    if (signingAuditor?.signature) {
        if (y + 40 > 280) { // Check for page break before signature
            doc.addPage();
            y = margin;
        }
        
        doc.setFontSize(10);
        doc.text(`Digitally Signed by ${signingAuditor.name}`, margin, y);
        y += 2;
        
        try {
            // Determine image type from data URL
            const signatureDataUrl = signingAuditor.signature;
            const mimeTypeMatch = signatureDataUrl.match(/data:(image\/(.+));base64,/);
            if (mimeTypeMatch) {
                const imageType = mimeTypeMatch[2].toUpperCase();
                doc.addImage(signatureDataUrl, imageType, margin, y, 60, 20); // Add image (w:60, h:20)
            } else {
                 doc.addImage(signatureDataUrl, 'PNG', margin, y, 60, 20);
            }
        } catch(e) {
            console.error("Error adding signature image to PDF:", e);
            doc.text('[Signature Image Error]', margin, y + 10);
        }
        y += 22;
        doc.line(margin, y, margin + 60, y); // Underline

        const metadata = decisionData.signatureMetadata;
        if (metadata) {
            y += 5;
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`Date: ${formatDateTime(metadata.timestamp)}`, margin, y);
            doc.text(`IP Address: ${metadata.ipAddress}`, margin, y + 4);
        }
    }

    return {
        pdfDataUri: doc.output('datauristring'),
        pdfBlob: doc.output('blob'),
    };
};


const AuditDetail: React.FC<AuditDetailProps> = ({ audit, auditors, workflows, onUpdate, onBack, onNavigateToReports, onDelete, userRole }) => {
  const [currentAudit, setCurrentAudit] = useState<Audit & { clauses: Clause[] }>(audit);
  const [activeClauseId, setActiveClauseId] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  
  const [modifiedClauses, setModifiedClauses] = useState<Set<string>>(new Set());
  const [savedStatus, setSavedStatus] = useState<{[key: string]: boolean}>({});

  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionDescription, setNewQuestionDescription] = useState('');
  
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);
  const [editedClauseTitle, setEditedClauseTitle] = useState('');
  const [editedClauseDescription, setEditedClauseDescription] = useState('');

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [meetingForm, setMeetingForm] = useState({ type: MeetingType.Opening, dateTime: '', duration: 60, meetingLink: '', notes: '' });
  
  const [viewingEvidence, setViewingEvidence] = useState<{name: string; dataUrl: string; type: string} | null>(null);

  const [clauseToDelete, setClauseToDelete] = useState<Clause | null>(null);
  const [isSubmitReviewConfirmOpen, setIsSubmitReviewConfirmOpen] = useState(false);
  const [auditorRecommendation, setAuditorRecommendation] = useState<AuditorRecommendation | ''>('');
  const [auditorSubRecommendation, setAuditorSubRecommendation] = useState<AuditorSubRecommendation | ''>('');
  
  const [isCertDecisionModalOpen, setIsCertDecisionModalOpen] = useState(false);
  const [reviewerActionType, setReviewerActionType] = useState<'certify' | 'action' | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [activeSidebarTab, setActiveSidebarTab] = useState<'meetings' | 'notes'>('meetings');
  const [newNoteContent, setNewNoteContent] = useState('');

  // State for the document management modal
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [stagedReviewDocs, setStagedReviewDocs] = useState<File[]>([]);
  const [docToDelete, setDocToDelete] = useState<AuditorDocument | null>(null);
  const [editingDoc, setEditingDoc] = useState<AuditorDocument | null>(null);
  const [editedDocName, setEditedDocName] = useState('');


  const isAuditorView = userRole === 'auditor' || userRole === 'administrator';
  const isReviewerView = userRole === 'technical_reviewer';

  const hasUnreadNotes = useMemo(() => {
    if (userRole === 'client') {
      return (currentAudit.generalNotes || []).some(note => !note.readByClient);
    }
    return false;
  }, [currentAudit.generalNotes, userRole]);
  
  const hasUnreadMeetings = useMemo(() => {
    if (userRole === 'client') {
      return (currentAudit.meetings || []).some(meeting => !meeting.readByClient);
    }
    return false;
  }, [currentAudit.meetings, userRole]);
  
  
  useEffect(() => {
    // When client switches to the notes tab, mark all notes as read
    if (userRole === 'client' && activeSidebarTab === 'notes' && hasUnreadNotes) {
        const updatedNotes = (currentAudit.generalNotes || []).map(note => ({ ...note, readByClient: true }));
        const { clauses, ...auditData } = currentAudit;
        onUpdate({ ...auditData, generalNotes: updatedNotes });
    }
    if (userRole === 'client' && activeSidebarTab === 'meetings' && hasUnreadMeetings) {
        const updatedMeetings = (currentAudit.meetings || []).map(meeting => ({ ...meeting, readByClient: true }));
        const { clauses, ...auditData } = currentAudit;
        onUpdate({ ...auditData, meetings: updatedMeetings });
    }
  }, [userRole, activeSidebarTab, hasUnreadNotes, hasUnreadMeetings, currentAudit, onUpdate]);


  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const sortedClauses = useMemo(() => {
    const allClauses = currentAudit.clauses;
    const order = currentAudit.clauseOrder || allClauses.map(c => c.id);

    const clauseMap = new Map(allClauses.map(c => [c.id, c]));
    const allClauseIds = new Set(allClauses.map(c => c.id));
    
    let orderDirty = false;
    const mutableOrder = [...order];

    allClauses.forEach(c => {
      if (!mutableOrder.includes(c.id)) {
        mutableOrder.push(c.id);
        orderDirty = true;
      }
    });
    
    const finalOrder = mutableOrder.filter(id => allClauseIds.has(id));
    if (finalOrder.length !== mutableOrder.length) {
        orderDirty = true;
    }

    if (orderDirty && isAuditorView) {
        const { clauses, ...auditData } = currentAudit;
        onUpdate({ ...auditData, clauseOrder: finalOrder });
    }

    return finalOrder.map(id => clauseMap.get(id)).filter(Boolean) as Clause[];
  }, [currentAudit.clauses, currentAudit.clauseOrder, onUpdate, isAuditorView]);


  const sections = useMemo(() => {
    const sectionSet = new Set<string>();
    sortedClauses.forEach(clause => {
        if (clause.isCustom && clause.section) {
            sectionSet.add(clause.section);
        } else if (!clause.isCustom) {
            if (clause.id.startsWith('Q-')) {
                sectionSet.add('Stage 1 Audit/ Initial Readiness Review');
            } else {
                const sectionNumber = clause.id.split('.')[0];
                if (!isNaN(parseInt(sectionNumber))) {
                    sectionSet.add(`Clause ${sectionNumber}`);
                }
            }
        }
    });
    
    const stage1Section = Array.from(sectionSet).filter(s => s === 'Stage 1 Audit/ Initial Readiness Review');
    const standardClauseSections = Array.from(sectionSet).filter(s => s.startsWith('Clause ')).sort((a, b) => {
        return parseInt(a.replace('Clause ', '')) - parseInt(b.replace('Clause ', ''));
    });
    
    const standardSections = [...stage1Section, ...standardClauseSections];

    // Always add "Additional Scope" tab
    const additionalScopeTab = 'Additional Scope';
    const clause10Index = standardSections.indexOf('Clause 10');
    if (clause10Index !== -1) {
        standardSections.splice(clause10Index + 1, 0, additionalScopeTab);
    } else {
        standardSections.push(additionalScopeTab);
    }

    const customSections = Array.from(sectionSet).filter(s => !s.startsWith('Clause ') && s !== 'Stage 1 Audit/ Initial Readiness Review' && s !== additionalScopeTab).sort();

    return [...standardSections, ...customSections];
  }, [sortedClauses]);
  
  const [activeTab, setActiveTab] = useState(sections[0] || null);
  
  useEffect(() => {
    setCurrentAudit(audit);
  }, [audit]);

  useEffect(() => {
    if (sections.length > 0 && (!activeTab || !sections.includes(activeTab))) {
        setActiveTab(sections[0]);
    } else if (sections.length === 0) {
        setActiveTab(null);
    }
  }, [sections, activeTab]);

  const handleClauseChange = (clauseId: string, field: keyof ClauseStatus, value: any) => {
    const updatedStatuses = currentAudit.statuses.map(status =>
      status.clauseId === clauseId ? { ...status, [field]: value } : status
    );
    setCurrentAudit(prev => ({ ...prev, statuses: updatedStatuses }));
    setModifiedClauses(prev => new Set(prev).add(clauseId));
  };
  
  const handleSaveChanges = (clauseId: string) => {
    let { clauses, ...auditToUpdate } = currentAudit;

    if (userRole === 'client') {
        const statusIndex = auditToUpdate.statuses.findIndex(s => s.clauseId === clauseId);
        if (statusIndex > -1) {
            const currentStatus = auditToUpdate.statuses[statusIndex];
            const hasEvidence = currentStatus.notes.trim() !== '' || (currentStatus.uploadedFiles && currentStatus.uploadedFiles.length > 0);
            
            const isInfoNeeded = currentStatus.auditorStatus === AuditorStatus.InfoNeeded;

            if ((currentStatus.auditorStatus === AuditorStatus.NotStarted && hasEvidence) || isInfoNeeded) {
                const updatedStatuses = [...auditToUpdate.statuses];
                updatedStatuses[statusIndex] = { ...currentStatus, auditorStatus: AuditorStatus.Pending };
                auditToUpdate = { ...auditToUpdate, statuses: updatedStatuses };
            }
        }
    }
    
    onUpdate(auditToUpdate);

    setModifiedClauses(prev => {
        const newSet = new Set(prev);
        newSet.delete(clauseId);
        return newSet;
    });
    setSavedStatus(prev => ({...prev, [clauseId]: true}));
    setTimeout(() => {
        setSavedStatus(prev => ({...prev, [clauseId]: false}));
    }, 2000);
  };

  const handleFileChange = (clauseId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFilesPromises = Array.from(files).map((file: File) => {
      return new Promise<{ name: string; type: string; size: number; dataUrl: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: reader.result as string
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newFilesPromises).then(newFiles => {
      const status = currentAudit.statuses.find(s => s.clauseId === clauseId);
      const existingFiles = status?.uploadedFiles || [];
      handleClauseChange(clauseId, 'uploadedFiles', [...existingFiles, ...newFiles]);
    });
  };

  const handleRemoveFile = (clauseId: string, fileIndex: number) => {
    const status = currentAudit.statuses.find(s => s.clauseId === clauseId);
    if (status && status.uploadedFiles) {
        const updatedFiles = status.uploadedFiles.filter((_, index) => index !== fileIndex);
        handleClauseChange(clauseId, 'uploadedFiles', updatedFiles);
    }
  };

  const progress = useMemo(() => {
    if (currentAudit.clauses.length === 0) return 0;
    const completedStatuses = [
      AuditorStatus.Accepted,
      AuditorStatus.MinorNC,
      AuditorStatus.MajorNC,
    ];
    const completedCount = currentAudit.statuses.filter(s => completedStatuses.includes(s.auditorStatus)).length;
    return (completedCount / currentAudit.clauses.length) * 100;
  }, [currentAudit.statuses, currentAudit.clauses]);

  const calculateTabProgress = (tab: string) => {
      const tabClauses = sortedClauses.filter(clause => {
        if (tab === 'Stage 1 Audit/ Initial Readiness Review') {
            return (!clause.isCustom && clause.id.startsWith('Q-')) || (clause.isCustom && clause.section === tab);
        }
        if (tab === 'Additional Scope') {
            return clause.isCustom && clause.section === 'Additional Scope';
        }
        if (clause.isCustom) {
          return clause.section === tab;
        }
        const sectionNumber = clause.id.split('.')[0];
        return `Clause ${sectionNumber}` === tab;
      });

      if (tabClauses.length === 0) return 0;

      const tabClauseIds = new Set(tabClauses.map(c => c.id));
      const relevantStatuses = currentAudit.statuses.filter(s => tabClauseIds.has(s.clauseId));
      
      if (relevantStatuses.length === 0) return 0;

      const completedStatuses = [
        AuditorStatus.Accepted,
        AuditorStatus.MinorNC,
        AuditorStatus.MajorNC,
      ];
      const completedCount = relevantStatuses.filter(s => completedStatuses.includes(s.auditorStatus)).length;
      return (completedCount / relevantStatuses.length) * 100;
  }
  
  const assignedAuditorDetails = auditors.find(a => a.name === currentAudit.assignedAuditor);

  const toggleClause = (clauseId: string) => {
    if (editingClauseId === clauseId) return;
    setActiveClauseId(prevId => (prevId === clauseId ? null : clauseId));
  };

  const handleContact = () => {
    let recipientEmail, subject;

    if (isAuditorView) {
        if (!currentAudit.clientRepEmail) {
            alert("Client Representative's email is not available.");
            return;
        }
        recipientEmail = currentAudit.clientRepEmail;
        subject = `Query regarding your Audit: ${currentAudit.clientName}`;
    } else {
        if (!assignedAuditorDetails || !assignedAuditorDetails.email) {
            alert("Auditor's email is not available.");
            return;
        }
        recipientEmail = assignedAuditorDetails.email;
        subject = `Query regarding Audit: ${currentAudit.clientName}`;
    }

    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(contactMessage)}`;
    window.location.href = mailtoLink;
    setIsContactModalOpen(false);
    setContactMessage('');
  };

  const clausesForTab = useMemo(() => {
    return sortedClauses.filter(clause => {
        if (activeTab === 'Stage 1 Audit/ Initial Readiness Review') {
            return (!clause.isCustom && clause.id.startsWith('Q-')) || (clause.isCustom && clause.section === activeTab);
        }
        if (activeTab === 'Additional Scope') {
            return clause.isCustom && clause.section === 'Additional Scope';
        }
        if (clause.isCustom) {
            return clause.section === activeTab;
        }
        const sectionNumber = clause.id.split('.')[0];
        return `Clause ${sectionNumber}` === activeTab;
    });
  }, [sortedClauses, activeTab]);

  const handleAddQuestion = () => {
    if (!newQuestionTitle.trim()) {
        alert('Question title cannot be empty.');
        return;
    }
    const newClause: Clause = {
        id: `custom-${crypto.randomUUID()}`,
        title: newQuestionTitle,
        description: newQuestionDescription,
        isCustom: true,
        section: activeTab,
    };
    const newStatus: ClauseStatus = {
        clauseId: newClause.id,
        notes: '',
        findings: '',
        uploadedFiles: [],
        auditorStatus: AuditorStatus.NotStarted,
    };

    const { clauses, ...auditData } = currentAudit;
    const currentOrder = auditData.clauseOrder || sortedClauses.map(c => c.id);

    const updatedAudit: Audit = {
        ...auditData,
        customClauses: [...(auditData.customClauses || []), newClause],
        clauseOrder: [...currentOrder, newClause.id],
        statuses: [...auditData.statuses, newStatus],
    };
    
    onUpdate(updatedAudit);

    setNewQuestionTitle('');
    setNewQuestionDescription('');
    setIsAddingQuestion(false);
  };

  const handleDeleteClause = (clauseId: string) => {
    const clause = currentAudit.clauses.find(c => c.id === clauseId);
    if (clause) {
        setClauseToDelete(clause);
    }
  };

  const confirmDeleteClause = () => {
    if (!clauseToDelete) return;

    const clauseId = clauseToDelete.id;
    const { clauses, ...auditToUpdate } = currentAudit;
    const updatedCustomClauses = (auditToUpdate.customClauses || []).filter(c => c.id !== clauseId);
    const updatedClauseOrder = (auditToUpdate.clauseOrder || []).filter(id => id !== clauseId);
    const updatedStatuses = auditToUpdate.statuses.filter(s => s.clauseId !== clauseId);
    
    const updatedAudit: Audit = {
        ...auditToUpdate,
        customClauses: updatedCustomClauses,
        clauseOrder: updatedClauseOrder,
        statuses: updatedStatuses,
    };
    
    onUpdate(updatedAudit);
    setClauseToDelete(null);
  };

  const handleStartEdit = (clause: Clause) => {
    setEditingClauseId(clause.id);
    setEditedClauseTitle(clause.title);
    setEditedClauseDescription(clause.description);
    setActiveClauseId(clause.id);
  };

  const handleCancelEdit = () => {
      setEditingClauseId(null);
  };

  const handleSaveEdit = () => {
      if (!editingClauseId) return;
      
      const { clauses, ...auditData } = currentAudit;
      const updatedCustomClauses = (auditData.customClauses || []).map(c => 
          c.id === editingClauseId 
          ? { ...c, title: editedClauseTitle, description: editedClauseDescription } 
          : c
      );

      const updatedAudit = { ...auditData, customClauses: updatedCustomClauses };
      onUpdate(updatedAudit);
      setEditingClauseId(null);
  };

    const handleDragStart = (e: React.DragEvent<HTMLSpanElement>, clauseId: string) => {
        e.dataTransfer.setData('text/plain', clauseId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetClauseId: string) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId === targetClauseId || !draggedId) {
            return;
        }

        const { clauses, ...auditData } = currentAudit;
        const currentOrder = [...(auditData.clauseOrder || sortedClauses.map(c => c.id))];

        const draggedIndex = currentOrder.findIndex(id => id === draggedId);
        const targetIndex = currentOrder.findIndex(id => id === targetClauseId);

        if (draggedIndex === -1 || targetIndex === -1) return;
        
        const [draggedItem] = currentOrder.splice(draggedIndex, 1);
        currentOrder.splice(targetIndex, 0, draggedItem);
        
        const updatedAudit = { ...auditData, clauseOrder: currentOrder };
        onUpdate(updatedAudit);
    };

    const openMeetingModal = (meeting: Meeting | null) => {
        if (meeting) {
            setEditingMeeting(meeting);
            setMeetingForm({
                ...meeting,
                dateTime: meeting.dateTime.substring(0, 16)
            });
        } else {
            setEditingMeeting(null);
            setMeetingForm({ type: MeetingType.Opening, dateTime: '', duration: 60, meetingLink: '', notes: '' });
        }
        setIsMeetingModalOpen(true);
    };

    const handleSaveMeeting = () => {
        const { dateTime, ...rest } = meetingForm;
        if (!dateTime || !rest.meetingLink) {
            alert('Please fill in Date/Time and Meeting Link.');
            return;
        }

        const meetingData = { ...rest, dateTime: new Date(dateTime).toISOString() };
        let updatedMeetings;
        if (editingMeeting) {
            updatedMeetings = (currentAudit.meetings || []).map(m => m.id === editingMeeting.id ? { ...m, ...meetingData, readByClient: false } : m);
        } else {
            const newMeeting = { ...meetingData, id: crypto.randomUUID(), readByClient: false };
            updatedMeetings = [...(currentAudit.meetings || []), newMeeting];
        }
        const { clauses, ...auditData } = currentAudit;
        const updatedAudit = { ...auditData, meetings: updatedMeetings };
        onUpdate(updatedAudit);
        setIsMeetingModalOpen(false);
    };
    
    const handleDeleteMeeting = (meetingId: string) => {
        if(window.confirm('Are you sure you want to delete this meeting?')) {
            const updatedMeetings = (currentAudit.meetings || []).filter(m => m.id !== meetingId);
            const { clauses, ...auditData } = currentAudit;
            const updatedAudit = { ...auditData, meetings: updatedMeetings };
            onUpdate(updatedAudit);
        }
    };
    
    const generateICS = (meeting: Meeting, clientName: string) => {
        const startDate = new Date(meeting.dateTime);
        const endDate = new Date(startDate.getTime() + meeting.duration * 60000);
        const toICSDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const icsContent = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GCSAuditSync//EN', 'BEGIN:VEVENT',
        `UID:${meeting.id}@gcsauditsync.com`, `DTSTAMP:${toICSDate(new Date())}`, `DTSTART:${toICSDate(startDate)}`, `DTEND:${toICSDate(endDate)}`,
        `SUMMARY:Audit Meeting: ${meeting.type} for ${clientName}`, `DESCRIPTION:Meeting Notes: ${meeting.notes.replace(/\n/g, '\\n')}\\nMeeting Link: ${meeting.meetingLink}`,
        `LOCATION:${meeting.meetingLink}`, 'END:VEVENT', 'END:VCALENDAR'
        ].join('\r\n');
        return icsContent;
    };

    const handleSaveToCalendar = (meeting: Meeting) => {
        const icsData = generateICS(meeting, currentAudit.clientName);
        const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `meeting-${meeting.id}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleShare = async (meeting: Meeting) => {
        const shareData = {
            title: `Audit Meeting: ${meeting.type}`,
            text: `You are invited to an audit meeting for ${currentAudit.clientName}.\nType: ${meeting.type}\nDate: ${formatDateTime(meeting.dateTime)}\nDuration: ${meeting.duration} minutes\nLink: ${meeting.meetingLink}\nNotes: ${meeting.notes}`,
            url: meeting.meetingLink
        };
        try {
            if(navigator.share) {
                await navigator.share(shareData);
            } else {
                navigator.clipboard.writeText(shareData.text);
                alert('Meeting details copied to clipboard!');
            }
        } catch (err) {
            console.error("Couldn't share meeting", err);
        }
    };
    
    const handleNoteSubmit = () => {
        if (!newNoteContent.trim()) {
            alert('Note content cannot be empty.');
            return;
        }
        const newNote: GeneralNote = {
            id: crypto.randomUUID(),
            content: newNoteContent,
            author: 'auditor',
            createdAt: new Date().toISOString(),
            readByClient: false,
        };

        const { clauses, ...auditData } = currentAudit;
        const updatedAudit = {
            ...auditData,
            generalNotes: [...(auditData.generalNotes || []), newNote],
        };
        onUpdate(updatedAudit);
        setNewNoteContent('');
    };

    const handleConfirmSubmitForReview = () => {
        const { clauses, ...auditData } = currentAudit;
        onUpdate({
            ...auditData,
            status: ClientStatus.PendingTechnicalReview,
            auditorRecommendation: auditorRecommendation as AuditorRecommendation,
            auditorSubRecommendation: auditorSubRecommendation ? auditorSubRecommendation as AuditorSubRecommendation : undefined,
        });
        setIsSubmitReviewConfirmOpen(false);
        setAuditorRecommendation('');
        setAuditorSubRecommendation('');
        alert('Audit submitted for technical review.');
        onBack();
    };
    
    const handleCertDecisionSubmit = async (decisionData: Omit<CertificationDecisionData, 'decisionDate'>) => {
        setIsGeneratingReport(true);
        
        let ipAddress = 'N/A';
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            if (response.ok) {
                const data = await response.json();
                ipAddress = data.ip;
            }
        } catch (error) {
            console.warn('Could not fetch IP address:', error);
        }
        
        const signingAuditor = auditors[0] || null;

        const signatureMetadata: SignatureMetadata = {
            ipAddress,
            timestamp: new Date().toISOString(),
            signerName: signingAuditor?.name || 'Unknown Reviewer',
        };

        const finalDecisionData: CertificationDecisionData = {
            ...decisionData,
            decisionDate: new Date().toISOString(),
            signatureMetadata,
        };

        try {
            const { pdfDataUri, pdfBlob } = generateDecisionReportPdf(currentAudit, finalDecisionData, signingAuditor || undefined);
            
            const reportDoc: AuditorDocument = {
                id: crypto.randomUUID(),
                name: 'Certification Decision Report.pdf',
                type: 'application/pdf',
                size: pdfBlob.size,
                dataUrl: pdfDataUri,
                uploadDate: new Date().toISOString(),
            };

            const { clauses, ...auditData } = currentAudit;

            const updatedStageDocs = [...(auditData.stageDocuments || [])];
            let stageEntry = updatedStageDocs.find(sd => sd.stage === auditData.currentStage);
            if (stageEntry) {
                stageEntry.documents.push(reportDoc);
            } else {
                updatedStageDocs.push({ stage: auditData.currentStage, documents: [reportDoc] });
            }

            const newStatus = reviewerActionType === 'certify' ? ClientStatus.Valid : ClientStatus.ActionRequired;
            const documentsToMove = newStatus === ClientStatus.ActionRequired ? (auditData.technicalReviewDocuments || []) : [];

            onUpdate({
                ...auditData,
                status: newStatus,
                auditorRecommendation: undefined,
                auditorSubRecommendation: undefined,
                certificationDecisionData: finalDecisionData,
                certificationDecisionReport: pdfDataUri,
                stageDocuments: updatedStageDocs,
                auditorDocuments: [...(auditData.auditorDocuments || []), ...documentsToMove],
                technicalReviewDocuments: newStatus === ClientStatus.ActionRequired ? [] : auditData.technicalReviewDocuments,
            });

            const successMessage = reviewerActionType === 'certify'
                ? 'Approved! The client has been certified and the report has been saved.'
                : 'Approved for action. The audit and relevant documents have been submitted to the client and auditor for follow-up.';
            
            alert(successMessage);
            onBack();

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("An error occurred while generating the report PDF.");
        } finally {
            setIsGeneratingReport(false);
            setIsCertDecisionModalOpen(false);
        }
    };
    
    const reviewerAction = useMemo(() => {
        const recommendation = currentAudit.auditorRecommendation;
        const subRecommendation = currentAudit.auditorSubRecommendation;

        if (recommendation === AuditorRecommendation.CertifyWithPending &&
            (subRecommendation === AuditorSubRecommendation.CAP || subRecommendation === AuditorSubRecommendation.MajorNCClosure)) {
            return { text: 'Approve for Action', action: () => { setReviewerActionType('action'); setIsCertDecisionModalOpen(true); }, disabled: false };
        }

        if (recommendation === AuditorRecommendation.CertifyAfterReview) {
            return { text: 'Approve & Certify', action: () => { setReviewerActionType('certify'); setIsCertDecisionModalOpen(true); }, disabled: false };
        }
        
        if (recommendation === AuditorRecommendation.Defer) {
          return {
              text: 'Return to Auditor',
              action: () => {
                if (!window.confirm('Are you sure you want to return this to the auditor? The recommendation was to defer.')) return;
                  const { clauses, ...auditData } = currentAudit;
                  onUpdate({
                      ...auditData,
                      status: ClientStatus.InProgress,
                      auditorRecommendation: undefined,
                      auditorSubRecommendation: undefined,
                  });
                  alert('Audit returned to auditor based on deferral recommendation.');
                  onBack();
              },
              disabled: false,
          }
        }

        return { text: 'Awaiting Auditor Recommendation', action: () => {}, disabled: true };
  }, [currentAudit, onUpdate, onBack]);

  const getDueDateClass = (dueDate: string): string => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);

        const diff = due.getTime() - now.getTime();

        if (diff < 0) return 'text-gray-500 font-semibold text-base';

        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const oneMonth = 30 * 24 * 60 * 60 * 1000;
        const threeMonths = 90 * 24 * 60 * 60 * 1000;
        
        const baseClass = 'px-2 py-1 rounded-md inline-block text-base';

        if (diff <= oneWeek) {
            return `bg-red-100 text-red-800 font-semibold ${baseClass}`;
        }
        if (diff <= oneMonth) {
            return `bg-orange-200 text-orange-800 font-semibold ${baseClass}`;
        }
        if (diff <= threeMonths) {
            return `bg-orange-100 text-orange-700 font-semibold ${baseClass}`;
        }
        
        return 'font-semibold text-base';
    };
    
    const handleReviewDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setStagedReviewDocs(prev => [...prev, ...Array.from(files)]);
        e.target.value = ''; // Reset file input
    };

    const handleRemoveStagedReviewDoc = (fileIndex: number) => {
        setStagedReviewDocs(prev => prev.filter((_, index) => index !== fileIndex));
    };

    const handleSaveReviewDocs = async () => {
        if (stagedReviewDocs.length === 0) {
            alert('No files staged to save.');
            return;
        }

        const newDocumentsPromises = stagedReviewDocs.map(file => {
            return new Promise<AuditorDocument>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve({
                        id: crypto.randomUUID(),
                        name: file.name,
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
        
        try {
            const newDocuments = await Promise.all(newDocumentsPromises);
            const { clauses, ...auditData } = currentAudit;
            const updatedAudit = {
                ...auditData,
                technicalReviewDocuments: [...(auditData.technicalReviewDocuments || []), ...newDocuments],
            };
            onUpdate(updatedAudit);
            setStagedReviewDocs([]);
            alert(`${newDocuments.length} file(s) saved for technical review.`);
        } catch (error) {
            console.error("Error processing files:", error);
            alert("There was an error saving the files.");
        }
    };
    
    const confirmDeleteReviewDoc = () => {
        if (!docToDelete) return;
        const { clauses, ...auditData } = currentAudit;
        const updatedDocs = (auditData.technicalReviewDocuments || []).filter(d => d.id !== docToDelete.id);
        onUpdate({ ...auditData, technicalReviewDocuments: updatedDocs });
        setDocToDelete(null);
    };

    const handleUpdateDocName = () => {
        if (!editingDoc || !editedDocName.trim()) {
            setEditingDoc(null);
            return;
        }
        const { clauses, ...auditData } = currentAudit;
        const updatedDocs = (auditData.technicalReviewDocuments || []).map(d =>
            d.id === editingDoc.id ? { ...d, name: editedDocName.trim() } : d
        );
        onUpdate({ ...auditData, technicalReviewDocuments: updatedDocs });
        setEditingDoc(null);
    };

    const isSubmitDisabled = useMemo(() => {
        return Math.round(progress) !== 100 || (currentAudit.technicalReviewDocuments || []).length === 0;
    }, [progress, currentAudit.technicalReviewDocuments]);

    const submitTooltip = useMemo(() => {
        if (!isSubmitDisabled) return '';
        const reasons = [];
        if (Math.round(progress) !== 100) {
            reasons.push('audit progress must be 100%');
        }
        if ((currentAudit.technicalReviewDocuments || []).length === 0) {
            reasons.push('at least one auditor report must be uploaded');
        }
        return `Cannot submit: ${reasons.join(' and ')}.`;
    }, [isSubmitDisabled, progress, currentAudit.technicalReviewDocuments]);

  const auditorSelectableStatuses = [
    AuditorStatus.Accepted,
    AuditorStatus.MinorNC,
    AuditorStatus.MajorNC,
    AuditorStatus.InfoNeeded,
  ];

  return (
    <div>
        {userRole === 'client' && (
            <div className="mb-4">
                <button onClick={onBack} className="font-semibold text-brand-primary hover:underline flex items-center gap-2">
                    <ArrowLeftIcon />
                    Back to Main Dashboard
                </button>
            </div>
        )}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                {/* Left Column: Client Info */}
                <div className="flex items-start gap-4">
                    {(userRole !== 'client' && userRole !== 'technical_reviewer') && (
                        <button onClick={onBack} className="mt-1 flex-shrink-0 flex items-center gap-2 text-text-secondary hover:text-brand-primary transition-colors font-medium">
                            <ArrowLeftIcon />
                        </button>
                    )}
                     {userRole === 'technical_reviewer' && (
                        <button onClick={onBack} className="mt-1 flex-shrink-0 flex items-center gap-2 text-text-secondary hover:text-brand-primary transition-colors font-medium">
                            <ArrowLeftIcon />
                             Back to Review List
                        </button>
                    )}
                    <div>
                        <p className="text-xl text-text-secondary mt-2">
                            Status: <span className={`px-2 py-1 text-base font-semibold rounded-full ${CLIENT_STATUS_CONFIG[currentAudit.status]?.colors || 'bg-gray-100 text-gray-800'}`}>
                                {CLIENT_STATUS_CONFIG[currentAudit.status]?.label || currentAudit.status}
                            </span>
                        </p>
                        <p className="text-xl text-text-secondary mt-2 font-medium">{currentAudit.standardId}</p>
                        <p className="text-xl text-text-secondary mt-1">
                            Audit Cycle: <span className="font-semibold">{currentAudit.currentStage}</span>
                        </p>
                        <p className="text-base text-text-secondary mt-1">
                            Due: <span className={getDueDateClass(currentAudit.dueDate)}>{formatDate(currentAudit.dueDate)}</span>
                        </p>
                    </div>
                </div>

                {/* Center Column: Progress Bar */}
                <div className="flex justify-center">
                    <CircularProgressBar progress={progress} size={100} strokeWidth={10} />
                </div>

                {/* Right Column: Auditor/Client Info & Actions */}
                <div className="flex flex-col items-end self-start">
                    {isAuditorView ? (
                        <>
                            <div className="flex items-center gap-4 text-right">
                                <div className="flex-grow">
                                    <p className="font-semibold text-text-primary text-lg">{currentAudit.clientRepName || currentAudit.clientName}</p>
                                    <p className="text-sm text-text-secondary">Client Representative</p>
                                    {currentAudit.clientRepEmail && (
                                        <p className="text-sm text-text-secondary mt-1">{currentAudit.clientRepEmail}</p>
                                    )}
                                </div>
                                {currentAudit.clientLogo ? (
                                    <img src={currentAudit.clientLogo} alt="Client Logo" className="h-12 w-12 rounded-full object-contain border flex-shrink-0" />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg flex-shrink-0">
                                        {(currentAudit.clientRepName || currentAudit.clientName).charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 flex justify-end items-center gap-2 flex-wrap">
                                <button onClick={() => setIsDocumentModalOpen(true)} className="bg-blue-600 text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                                    Auditor Reports
                                </button>
                                <button
                                    onClick={() => setIsSubmitReviewConfirmOpen(true)}
                                    disabled={isSubmitDisabled}
                                    title={submitTooltip}
                                    className="bg-green-600 text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Submit for Technical Review
                                </button>
                            </div>
                            {userRole === 'administrator' && (
                                <div className="mt-2 self-end">
                                    <button
                                        onClick={() => { if (window.confirm('Are you sure you want to delete this audit?')) onDelete(currentAudit.id) }}
                                        className="bg-red-100 text-red-700 p-2 rounded-lg shadow-sm hover:bg-red-200 transition-colors text-xs font-semibold flex items-center gap-1"
                                        aria-label="Delete Audit"
                                    >
                                        <Trash2Icon /> Delete
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 text-right">
                                <div className="flex-grow">
                                    <p className="font-semibold text-text-primary text-lg">{currentAudit.assignedAuditor}</p>
                                    <p className="text-sm text-text-secondary">Assigned Auditor</p>
                                     {assignedAuditorDetails?.email && (
                                        <p className="text-sm text-text-secondary mt-1">{assignedAuditorDetails.email}</p>
                                    )}
                                </div>
                                {assignedAuditorDetails?.photo ? (
                                    <img src={assignedAuditorDetails.photo} alt={assignedAuditorDetails.name} className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg flex-shrink-0">
                                        {currentAudit.assignedAuditor.charAt(0)}
                                    </div>
                                )}
                            </div>
                           { userRole === 'client' &&
                            <div className="mt-3 flex justify-end gap-2">
                                <button
                                    onClick={onNavigateToReports}
                                    className="relative bg-yellow-600 text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-yellow-700 transition-colors"
                                >
                                    Reports & Actions
                                    {[
                                        ClientStatus.ActionRequired,
                                        ClientStatus.CorrectiveActionPendingReview,
                                        ClientStatus.CorrectiveActionApproved,
                                    ].includes(currentAudit.status) && (
                                        <span className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                                    )}
                                </button>
                                <button onClick={() => setIsContactModalOpen(true)} className="bg-brand-primary text-white font-bold py-2 px-3 rounded-lg text-sm hover:bg-brand-accent transition-colors">
                                    Contact GCS Auditor
                                </button>
                            </div>
                            }
                        </>
                    )}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                {/* Tabs */}
                <div className="mb-6 bg-white rounded-lg shadow-md">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-2 overflow-x-auto p-2" aria-label="Tabs">
                            {sections.map(section => (
                                <div key={section} className="flex flex-col items-center">
                                    <button
                                        onClick={() => setActiveTab(section)}
                                        className={`${
                                            activeTab === section
                                                ? 'border-brand-primary text-brand-primary bg-brand-primary/10'
                                                : 'border-transparent text-text-secondary hover:text-gray-700 hover:border-gray-300 hover:bg-brand-primary/10'
                                        } whitespace-nowrap pt-3 pb-2 px-4 border-b-2 font-medium text-lg transition-colors focus:outline-none rounded-t-lg`}
                                    >
                                        {section}
                                    </button>
                                    <div className="w-full mt-1 px-1">
                                        <ProgressBar progress={calculateTabProgress(section)} height="h-4" />
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>

                {isAuditorView && activeTab && (
                    <div className="mb-6">
                        {!isAddingQuestion ? (
                            <button onClick={() => setIsAddingQuestion(true)} className="bg-brand-secondary text-text-primary font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-gray-200 transition-colors">
                                + Add Additional Question
                            </button>
                        ) : (
                            <div className="bg-white p-4 rounded-lg shadow-md border">
                                <h3 className="font-semibold text-lg mb-2 text-text-primary">New Additional Question for {activeTab}</h3>
                                <input
                                    type="text"
                                    value={newQuestionTitle}
                                    onChange={(e) => setNewQuestionTitle(e.target.value)}
                                    placeholder="Question Title"
                                    className="w-full input-field mb-2"
                                />
                                <textarea
                                    value={newQuestionDescription}
                                    onChange={(e) => setNewQuestionDescription(e.target.value)}
                                    placeholder="Description (optional)"
                                    rows={3}
                                    className="w-full input-field mb-4"
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsAddingQuestion(false)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300">
                                        Cancel
                                    </button>
                                    <button onClick={handleAddQuestion} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-accent">
                                        Save Question
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {/* Clauses */}
                <div className="space-y-4">
                    {clausesForTab.length > 0 ? clausesForTab.map(clause => {
                        const status = currentAudit.statuses.find(s => s.clauseId === clause.id);
                        if (!status) return null;
                        const isEditing = editingClauseId === clause.id;
                        const statusConfig = AUDITOR_STATUS_CONFIG[status.auditorStatus];
                        const isActive = activeClauseId === clause.id;
                        const isModified = modifiedClauses.has(clause.id);
                        const isSaved = savedStatus[clause.id];
                        const isInfoNeeded = status.auditorStatus === AuditorStatus.InfoNeeded;
                        const isNonConformance = [AuditorStatus.MinorNC, AuditorStatus.MajorNC].includes(status.auditorStatus);
                        return (
                            <div key={clause.id} className="bg-white rounded-lg shadow-md overflow-hidden" onDragOver={isAuditorView ? handleDragOver : undefined} onDrop={isAuditorView ? (e) => handleDrop(e, clause.id) : undefined}>
                                <div className="w-full text-left p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => toggleClause(clause.id)}>
                                    <div className="flex items-center gap-3 flex-grow min-w-0">
                                        {isAuditorView && (<span className="cursor-move text-gray-400" draggable={!isEditing} onDragStart={!isEditing ? (e) => handleDragStart(e, clause.id) : undefined} onClick={(e) => e.stopPropagation()}><GripVerticalIcon /></span>)}
                                        {isEditing ? (
                                            <div className="flex-grow space-y-2">
                                                <input type="text" value={editedClauseTitle} onChange={(e) => setEditedClauseTitle(e.target.value)} className="w-full input-field font-semibold text-lg" onClick={(e) => e.stopPropagation()}/>
                                                <textarea value={editedClauseDescription} onChange={(e) => setEditedClauseDescription(e.target.value)} className="w-full input-field text-base" rows={2} onClick={(e) => e.stopPropagation()}/>
                                            </div>
                                        ) : (
                                            <div className="flex-grow">
                                                <h3 className="font-semibold text-brand-primary text-lg">{clause.isCustom ? '' : `${clause.id} - `}{clause.title}</h3>
                                                <p className="text-base text-text-secondary mt-1">{clause.description}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusConfig.colors}`}>{statusConfig.label}</span>
                                        {isAuditorView && clause.isCustom && (
                                            <div className="flex items-center gap-1">
                                                {isEditing ? (
                                                    <>
                                                        <button onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }} className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-100 transition-colors" aria-label="Save changes"><CheckIcon /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors" aria-label="Cancel edit"><XIcon /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={(e) => { e.stopPropagation(); handleStartEdit(clause); }} className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition-colors" aria-label="Edit custom question"><EditIcon /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteClause(clause.id); }} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors" aria-label="Delete custom question"><Trash2Icon /></button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        <span className={`transform transition-transform ${isActive ? 'rotate-180' : ''}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                        </span>
                                    </div>
                                </div>
                                {isActive && (
                                    <div className="p-4 border-t border-gray-200">
                                        {(isAuditorView || isReviewerView) ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                                {/* Left Column */}
                                                <div>
                                                    <div className="mb-2">
                                                        <label className="block text-lg font-semibold text-text-secondary mb-2">Client Uploads</label>
                                                        <div className="bg-gray-50 p-4 rounded-lg min-h-[120px]">
                                                            <div className="space-y-2">
                                                                {status.uploadedFiles && status.uploadedFiles.length > 0 ? (
                                                                    status.uploadedFiles.map((file, index) => (
                                                                    <div key={index} className="flex items-center justify-between gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                                                        <button onClick={() => setViewingEvidence({name: file.name, dataUrl: file.dataUrl || '', type: file.type})} className="flex items-center gap-3 flex-grow min-w-0">
                                                                            <FileTextIcon />
                                                                            <div className="text-left">
                                                                                <p className="text-base text-blue-800 font-medium truncate">{file.name}</p>
                                                                                <p className="text-sm text-blue-600">{(file.size / 1024).toFixed(2)} KB</p>
                                                                            </div>
                                                                        </button>
                                                                    </div>
                                                                ))
                                                                ) : (
                                                                    <div className="text-center py-4 px-2 border-2 border-dashed rounded-lg bg-white">
                                                                        <p className="text-base text-gray-500">No uploads.</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-lg font-semibold text-text-secondary mb-2">Evidence / Notes</label>
                                                        <textarea
                                                            value={status.notes}
                                                            rows={4}
                                                            className="w-full input-field resize-none overflow-hidden text-base bg-gray-100"
                                                            placeholder="Client's notes and evidence links (read-only)."
                                                            readOnly={true}
                                                        />
                                                    </div>
                                                </div>
                                                {/* Right Column */}
                                                <div>
                                                    <div className="mb-2">
                                                        <label className="block text-lg font-semibold text-text-secondary mb-2">Status</label>
                                                         <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                                                            {isReviewerView ? (
                                                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusConfig.colors}`}>{statusConfig.label}</span>
                                                            ) : (
                                                                auditorSelectableStatuses.map(s => (
                                                                    <label key={s} className="flex items-center space-x-2 cursor-pointer">
                                                                        <input
                                                                            type="radio"
                                                                            name={`status-${clause.id}`}
                                                                            value={s}
                                                                            checked={status.auditorStatus === s}
                                                                            onChange={e => handleClauseChange(clause.id, 'auditorStatus', e.target.value as AuditorStatus)}
                                                                            className="h-4 w-4 text-brand-primary border-gray-300 focus:ring-brand-accent focus:ring-2"
                                                                        />
                                                                        <span className={`text-base font-medium`}>
                                                                            {AUDITOR_STATUS_CONFIG[s].label}
                                                                        </span>
                                                                    </label>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-lg font-semibold text-text-secondary mb-2">Auditor Findings</label>
                                                        <textarea
                                                            value={status.findings}
                                                             onChange={isAuditorView ? e => {
                                                                handleClauseChange(clause.id, 'findings', e.target.value);
                                                                handleAutoResize(e);
                                                            } : undefined}
                                                            rows={4}
                                                            className={`w-full input-field resize-none overflow-hidden text-base ${isReviewerView ? 'bg-gray-100' : ''}`}
                                                            placeholder={isAuditorView ? "Enter findings..." : "Auditor's findings (read-only)."}
                                                            readOnly={isReviewerView}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-lg font-semibold text-text-secondary mb-2">Evidence / Notes</label>
                                                    <textarea
                                                        value={status.notes}
                                                        onChange={e => {
                                                            handleClauseChange(clause.id, 'notes', e.target.value);
                                                            handleAutoResize(e);
                                                        }}
                                                        rows={2}
                                                        className="w-full input-field resize-none overflow-hidden text-base"
                                                        placeholder={"Client can add notes and evidence links here..."}
                                                        disabled={!isInfoNeeded && status.auditorStatus !== AuditorStatus.NotStarted}
                                                    />
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <label className="mb-4 w-full block text-center cursor-pointer bg-brand-primary hover:bg-brand-accent text-white font-semibold py-2 px-3 rounded-md text-base transition-colors flex items-center justify-center gap-2">
                                                        <UploadIcon /> Upload File(s)
                                                        <input type="file" multiple onChange={(e) => handleFileChange(clause.id, e)} className="hidden" />
                                                    </label>
                                                    <div className="space-y-2">
                                                        {status.uploadedFiles && status.uploadedFiles.length > 0 ? (
                                                            status.uploadedFiles.map((file, index) => (
                                                            <div key={index} className="flex items-center justify-between gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                                                <button onClick={() => setViewingEvidence({name: file.name, dataUrl: file.dataUrl || '', type: file.type})} className="flex items-center gap-3 flex-grow min-w-0">
                                                                    <FileTextIcon />
                                                                    <div className="text-left">
                                                                        <p className="text-base text-blue-800 font-medium truncate">{file.name}</p>
                                                                        <p className="text-sm text-blue-600">{(file.size / 1024).toFixed(2)} KB</p>
                                                                    </div>
                                                                </button>
                                                                {userRole === 'client' && (
                                                                    <button onClick={() => handleRemoveFile(clause.id, index)} className="p-1 text-red-500 hover:bg-red-100 rounded-full flex-shrink-0" aria-label={`Remove ${file.name}`}>
                                                                        <Trash2Icon />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))
                                                        ) : (
                                                            <div className="text-center py-4 px-2 border-2 border-dashed rounded-lg bg-white">
                                                                <p className="text-base text-gray-500">No uploads.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {!isAuditorView && isNonConformance && (
                                            <div className={`mt-4 p-4 border-l-4 ${
                                                status.auditorStatus === AuditorStatus.MinorNC 
                                                ? 'bg-yellow-50 border-yellow-400' 
                                                : 'bg-red-50 border-red-400'
                                            }`}>
                                                <p className={`font-semibold ${
                                                    status.auditorStatus === AuditorStatus.MinorNC 
                                                    ? 'text-yellow-800' 
                                                    : 'text-red-800'
                                                }`}>{statusConfig.label} Identified</p>
                                                <p className={`mt-1 ${
                                                    status.auditorStatus === AuditorStatus.MinorNC 
                                                    ? 'text-yellow-700' 
                                                    : 'text-red-700'
                                                }`}>The Auditor will present details of this during the closing Meeting</p>
                                            </div>
                                        )}

                                        {isInfoNeeded && status.findings && (
                                            <div className="mt-4 p-4 bg-purple-50 border-l-4 border-purple-400">
                                                <p className="font-semibold text-purple-800">Additional Information Needed</p>
                                                <p className="text-purple-700 mt-1">{status.findings}</p>
                                            </div>
                                        )}

                                        {(isModified || isSaved) && (
                                            <div className="mt-4 flex justify-end">
                                                {isModified && !isSaved && (
                                                    <button onClick={() => handleSaveChanges(clause.id)} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-brand-accent transition-colors">
                                                        Save Changes
                                                    </button>
                                                )}
                                                {isSaved && (
                                                    <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                                                        <CheckIcon /> Saved
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    }) : <p className="text-center text-text-secondary italic py-6">No questions in this section.</p>}
                </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
                {isReviewerView && (
                    <>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                             <h3 className="text-lg font-semibold text-text-primary mb-4 border-b pb-2 flex items-center gap-2"><FileTextIcon /> Auditor Submitted Reports</h3>
                            {(currentAudit.technicalReviewDocuments || []).length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {(currentAudit.technicalReviewDocuments || []).map(doc => (
                                        <div key={doc.id} className="flex items-center justify-between gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                            <div className="flex items-center gap-3 flex-grow min-w-0">
                                                <FileTextIcon />
                                                <div className="text-left">
                                                    <p className="text-sm text-blue-800 font-medium truncate">{doc.name}</p>
                                                    <p className="text-xs text-blue-600">Uploaded: {formatDate(doc.uploadDate)}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setViewingEvidence({name: doc.name, dataUrl: doc.dataUrl, type: doc.type})} className="text-sm font-semibold bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-50 transition-colors">
                                                View
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-sm text-gray-500 italic py-4">No reports submitted for review.</p>
                            )}
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-text-primary mb-4 border-b pb-2 flex items-center gap-2"><ShieldCheckIcon/> Technical Review Actions</h3>
                            {currentAudit.auditorRecommendation && (
                                <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                                    <p className="text-sm font-semibold text-indigo-800">Auditor Recommendation:</p>
                                    <p className="text-sm text-indigo-700 mt-1">{currentAudit.auditorRecommendation}</p>
                                    {currentAudit.auditorSubRecommendation && <p className="text-xs text-indigo-600 mt-1">({currentAudit.auditorSubRecommendation})</p>}
                                </div>
                            )}
                            <button
                                onClick={reviewerAction.action}
                                disabled={reviewerAction.disabled}
                                className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {reviewerAction.text}
                            </button>
                        </div>
                    </>
                )}
                {userRole !== 'technical_reviewer' && (
                     <div className="bg-white rounded-lg shadow-md">
                        <div className="p-1.5 bg-gray-100 flex rounded-t-lg">
                            <button onClick={() => setActiveSidebarTab('meetings')} className={`flex-1 p-2 rounded-md font-semibold text-sm flex items-center justify-center gap-2 relative transition-colors ${activeSidebarTab === 'meetings' ? 'bg-gray-200 text-brand-primary' : 'text-text-secondary hover:bg-gray-200'}`}>
                                <CalendarIcon /> Meetings
                                {hasUnreadMeetings && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>}
                            </button>
                            <button onClick={() => setActiveSidebarTab('notes')} className={`flex-1 p-2 rounded-md font-semibold text-sm flex items-center justify-center gap-2 relative transition-colors ${activeSidebarTab === 'notes' ? 'bg-gray-200 text-brand-primary' : 'text-text-secondary hover:bg-gray-200'}`}>
                                <MessageSquareIcon /> Notes
                                {hasUnreadNotes && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>}
                            </button>
                        </div>
                        <div className="p-4">
                        {activeSidebarTab === 'meetings' && (
                            <div>
                                {isAuditorView && (
                                    <button onClick={() => openMeetingModal(null)} className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-brand-accent transition-colors flex items-center justify-center gap-2 mb-4">
                                        <PlusIcon /> Schedule New Meeting
                                    </button>
                                )}
                                <h4 className="text-md font-semibold text-text-primary mb-2">All Meetings</h4>
                                {(currentAudit.meetings || []).length > 0 ? (
                                    <div className="space-y-3 max-h-80 overflow-y-auto">
                                        {[...(currentAudit.meetings || [])]
                                            .sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
                                            .map(meeting => (
                                            <div key={meeting.id} className="p-3 bg-gray-50 rounded-lg border">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold text-text-primary">{meeting.type}</p>
                                                        <p className="text-sm text-text-secondary">{formatDateTime(meeting.dateTime)}</p>
                                                    </div>
                                                    {isAuditorView && (
                                                         <div className="flex gap-1 flex-shrink-0">
                                                            <button onClick={() => openMeetingModal(meeting)} className="p-1 rounded-full hover:bg-blue-100 text-blue-500" aria-label="Edit Meeting"><EditIcon /></button>
                                                            <button onClick={() => handleDeleteMeeting(meeting.id)} className="p-1 rounded-full hover:bg-red-100 text-red-500" aria-label="Delete Meeting"><Trash2Icon /></button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-100 text-blue-800 font-semibold py-1 px-2 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1"><VideoIcon /> Join</a>
                                                    <button onClick={() => handleShare(meeting)} className="text-xs bg-gray-200 text-gray-800 font-semibold py-1 px-2 rounded-full hover:bg-gray-300 transition-colors flex items-center gap-1"><ShareIcon /> Share</button>
                                                    <button onClick={() => handleSaveToCalendar(meeting)} className="text-xs bg-gray-200 text-gray-800 font-semibold py-1 px-2 rounded-full hover:bg-gray-300 transition-colors flex items-center gap-1"><CalendarIcon /> Add to Cal</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-text-secondary italic text-center py-4">No meetings scheduled.</p>}
                            </div>
                        )}
                        {activeSidebarTab === 'notes' && (
                            <div>
                                {isAuditorView && (
                                    <div className="mb-4">
                                        <textarea value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} rows={3} className="w-full input-field" placeholder="Add a new note for the client..."/>
                                        <button onClick={handleNoteSubmit} className="w-full mt-2 bg-brand-primary text-white font-bold py-2 px-3 rounded-md text-sm hover:bg-brand-accent transition-colors">Submit Note</button>
                                    </div>
                                )}
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {(currentAudit.generalNotes || []).length > 0 ? (
                                        [...currentAudit.generalNotes].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(note => (
                                            <div key={note.id} className="p-3 bg-gray-50 rounded-lg border">
                                                <p className="text-xs text-text-secondary mb-1">{formatDateTime(note.createdAt)}</p>
                                                <p className="text-sm text-text-primary whitespace-pre-wrap">{note.content}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-text-secondary italic text-center py-4">No general notes have been added.</p>
                                    )}
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Modals */}
        {isContactModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg">
                    <h3 className="text-2xl font-bold text-text-primary mb-4">Contact {isAuditorView ? 'Client' : 'Auditor'}</h3>
                    <textarea value={contactMessage} onChange={e => setContactMessage(e.target.value)} rows={6} className="w-full input-field" placeholder="Enter your message here..."/>
                    <div className="flex justify-end gap-4 mt-4">
                        <button onClick={() => setIsContactModalOpen(false)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button onClick={handleContact} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-accent">Send Email</button>
                    </div>
                </div>
            </div>
        )}

        {clauseToDelete && (
             <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
                <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                    <h3 className="text-2xl font-bold mb-4 text-red-600">Confirm Deletion</h3>
                    <p className="text-text-secondary mb-6">
                        Are you sure you want to permanently delete this question: <br/>"<span className="font-semibold">{clauseToDelete.title}</span>"?
                        <br /><br />
                        <span className="font-bold">This action cannot be undone.</span>
                    </p>
                    <div className="flex justify-end gap-4 mt-8">
                        <button onClick={() => setClauseToDelete(null)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={confirmDeleteClause}
                            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Confirm Delete
                        </button>
                    </div>
                </div>
            </div>
        )}

        {isMeetingModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg">
                    <h3 className="text-2xl font-bold text-text-primary mb-4">{editingMeeting ? 'Edit' : 'Schedule'} Meeting</h3>
                    <div className="space-y-4">
                        <select value={meetingForm.type} onChange={e => setMeetingForm(f => ({ ...f, type: e.target.value as MeetingType }))} className="w-full input-field">
                            {Object.values(MeetingType).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <input type="datetime-local" value={meetingForm.dateTime} onChange={e => setMeetingForm(f => ({ ...f, dateTime: e.target.value }))} className="w-full input-field" />
                        <input type="number" value={meetingForm.duration} onChange={e => setMeetingForm(f => ({ ...f, duration: parseInt(e.target.value, 10) }))} className="w-full input-field" placeholder="Duration (minutes)" />
                        <input type="url" value={meetingForm.meetingLink} onChange={e => setMeetingForm(f => ({ ...f, meetingLink: e.target.value }))} className="w-full input-field" placeholder="Meeting Link (e.g., Zoom, Teams)" />
                        <textarea value={meetingForm.notes} onChange={e => setMeetingForm(f => ({ ...f, notes: e.target.value }))} rows={3} className="w-full input-field" placeholder="Notes (optional)" />
                    </div>
                    <div className="flex justify-end gap-4 mt-4">
                        <button onClick={() => setIsMeetingModalOpen(false)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button onClick={handleSaveMeeting} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-accent">Save Meeting</button>
                    </div>
                </div>
            </div>
        )}

        {viewingEvidence && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setViewingEvidence(null)}>
                <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <h3 className="text-2xl font-bold text-text-primary truncate pr-4">{viewingEvidence.name}</h3>
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

        {isSubmitReviewConfirmOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
                <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                    <h3 className="text-2xl font-bold mb-4 text-text-primary flex items-center gap-2"><AlertTriangleIcon /> Confirm Submission</h3>
                    <p className="text-text-secondary mb-6">
                        You are about to submit this audit for technical review. Please select your final recommendation. This will lock the audit until a reviewer takes action.
                    </p>
                    <div className="space-y-4">
                        <select
                            value={auditorRecommendation}
                            onChange={(e) => {
                                setAuditorRecommendation(e.target.value as AuditorRecommendation);
                                setAuditorSubRecommendation('');
                            }}
                            className="w-full input-field"
                        >
                            <option value="" disabled>-- Select Recommendation --</option>
                            {Object.values(AuditorRecommendation).map(rec => <option key={rec} value={rec}>{rec}</option>)}
                        </select>
                        {auditorRecommendation === AuditorRecommendation.CertifyWithPending && (
                            <select
                                value={auditorSubRecommendation}
                                onChange={(e) => setAuditorSubRecommendation(e.target.value as AuditorSubRecommendation)}
                                className="w-full input-field"
                            >
                                <option value="" disabled>-- Select Reason --</option>
                                {Object.values(AuditorSubRecommendation).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                        )}
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button onClick={() => setIsSubmitReviewConfirmOpen(false)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmSubmitForReview}
                            disabled={!auditorRecommendation || (auditorRecommendation === AuditorRecommendation.CertifyWithPending && !auditorSubRecommendation)}
                            className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        {isCertDecisionModalOpen && (
            <CertificationDecisionModal
                isOpen={isCertDecisionModalOpen}
                onClose={() => setIsCertDecisionModalOpen(false)}
                onSubmit={handleCertDecisionSubmit}
                isSubmitting={isGeneratingReport}
            />
        )}
        
        {isDocumentModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
                <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                         <h3 className="text-2xl font-bold text-text-primary">Auditor Reports for Technical Review</h3>
                         <button onClick={() => setIsDocumentModalOpen(false)} className="text-gray-500 hover:text-gray-800 text-3xl font-bold leading-none">&times;</button>
                    </div>
                   
                    <div className="flex-grow overflow-y-auto pr-4 -mr-4">
                        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                            <h4 className="font-semibold text-text-primary mb-2">Upload New Reports</h4>
                            <p className="text-sm text-text-secondary mb-3">Upload your final audit reports and any other necessary documents for the technical reviewer to assess.</p>
                             <div className="flex items-center gap-4">
                                <label className="flex-grow block text-left cursor-pointer bg-brand-secondary hover:bg-gray-200 text-text-primary font-semibold py-2 px-3 rounded-md text-sm transition-colors">
                                    {stagedReviewDocs.length > 0 ? `${stagedReviewDocs.length} file(s) selected` : 'Choose File(s)'}
                                    <input type="file" multiple onChange={handleReviewDocFileChange} className="hidden" />
                                </label>
                                {stagedReviewDocs.length > 0 && <button onClick={handleSaveReviewDocs} className="bg-brand-primary text-white font-bold py-2 px-3 rounded-md hover:bg-brand-accent transition-colors text-sm">Save Uploads</button>}
                            </div>
                            {stagedReviewDocs.length > 0 && (
                                <ul className="mt-3 space-y-1">
                                    {stagedReviewDocs.map((file, index) => (
                                        <li key={index} className="text-xs flex justify-between items-center bg-white p-1.5 rounded border">
                                            <span>{file.name}</span>
                                            <button onClick={() => handleRemoveStagedReviewDoc(index)} className="text-red-500"><Trash2Icon/></button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <h4 className="font-semibold text-text-primary mb-2">Uploaded Documents</h4>
                            <div className="space-y-2">
                                {(currentAudit.technicalReviewDocuments || []).length > 0 ? (currentAudit.technicalReviewDocuments || []).map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                        <div className="flex items-center gap-3 flex-grow min-w-0">
                                            <FileTextIcon />
                                            <div className="text-left flex-grow">
                                                {editingDoc?.id === doc.id ? (
                                                    <input type="text" value={editedDocName} onChange={(e) => setEditedDocName(e.target.value)} className="w-full input-field text-sm" autoFocus onBlur={handleUpdateDocName} onKeyDown={(e) => e.key === 'Enter' && handleUpdateDocName()}/>
                                                ) : (
                                                    <p className="text-sm text-blue-800 font-medium truncate">{doc.name}</p>
                                                )}
                                                <p className="text-xs text-blue-600">Uploaded: {formatDate(doc.uploadDate)}</p>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 flex items-center gap-2">
                                            <button onClick={() => { setEditingDoc(doc); setEditedDocName(doc.name); }} className="p-1 text-blue-500 hover:bg-blue-100 rounded-full"><EditIcon /></button>
                                            <button onClick={() => setDocToDelete(doc)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2Icon /></button>
                                        </div>
                                    </div>
                                )) : <p className="text-center text-sm text-gray-500 italic py-4">No documents uploaded for review yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>
                {docToDelete && (
                     <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[70] p-4">
                        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4 text-red-600">Delete Document?</h3>
                            <p className="text-text-secondary mb-6">Are you sure you want to delete <span className="font-semibold">{docToDelete.name}</span>?</p>
                            <div className="flex justify-end gap-4">
                                <button onClick={() => setDocToDelete(null)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                                <button onClick={confirmDeleteReviewDoc} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Delete</button>
                            </div>
                        </div>
                    </div>
                )}
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


const CertificationDecisionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<CertificationDecisionData, 'decisionDate'>) => void;
    isSubmitting: boolean;
}> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
    
    type Answers = Omit<CertificationDecisionData, 'decisionDate'>['answers'];
    
    const [answers, setAnswers] = useState<Partial<Answers>>({});
    const [decision, setDecision] = useState<'Granted' | 'Not Granted' | null>(null);

    const isFormComplete = useMemo(() => {
        return certQuestions.every(q => answers[q.key as keyof Answers]) && decision;
    }, [answers, decision]);

    const handleAnswerChange = (key: keyof Answers, value: any) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        if (isFormComplete) {
            onSubmit({ answers: answers as Answers, decision: decision! });
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <h3 className="text-2xl font-bold mb-6 text-text-primary border-b pb-4">Certification Decision</h3>
                <div className="overflow-y-auto pr-4 -mr-4 flex-grow">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 text-left font-semibold text-text-primary border">QUESTIONS</th>
                                <th className="p-3 text-left font-semibold text-text-primary border">ANSWERS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {certQuestions.map(q => (
                                <tr key={q.key} className="border-b">
                                    <td className="p-3 text-text-secondary border-l border-r align-top">{q.text}</td>
                                    <td className="p-3 text-text-secondary border-r">
                                        <div className="flex items-center gap-4">
                                            {q.options.map(opt => (
                                                <label key={opt} className="flex items-center gap-1 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={q.key}
                                                        value={opt}
                                                        checked={answers[q.key as keyof Answers] === opt}
                                                        onChange={() => handleAnswerChange(q.key as keyof Answers, opt)}
                                                        className="h-4 w-4 text-brand-primary border-gray-300 focus:ring-brand-accent"
                                                    />
                                                    {opt}
                                                </label>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                        <h4 className="font-semibold text-text-primary mb-2">Certification Decision</h4>
                        <p className="text-sm text-text-secondary mb-3">Based on the information received for assessment & review, and recommendation by the Lead Auditor, on behalf of GCS, the decision to certify is hereby</p>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-lg">
                                <input type="radio" name="decision" value="Granted" checked={decision === 'Granted'} onChange={() => setDecision('Granted')} className="h-5 w-5 text-green-600 border-gray-300 focus:ring-green-500" />
                                <span className="text-green-700">GRANTED</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-lg">
                                <input type="radio" name="decision" value="Not Granted" checked={decision === 'Not Granted'} onChange={() => setDecision('Not Granted')} className="h-5 w-5 text-red-600 border-gray-300 focus:ring-red-500" />
                                <span className="text-red-700">NOT GRANTED</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
                    <button onClick={onClose} disabled={isSubmitting} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                    <button onClick={handleSubmit} disabled={!isFormComplete || isSubmitting} className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-accent disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
                        {isSubmitting && <SpinnerIcon />}
                        {isSubmitting ? 'Submitting...' : 'Submit Decision'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditDetail;
