
import { ISOStandardID } from './constants';

export interface Auditor {
  name: string;
  email: string;
  photo?: string;
  signature?: string; // base64 data URL
  approvedCodes?: string[];
}

export enum AuditorStatus {
    NotStarted = 'Not Started',
    Pending = 'Pending Review',
    Accepted = 'Accepted',
    MinorNC = 'Minor Nonconformance',
    MajorNC = 'Major Nonconformance',
    InfoNeeded = 'Additional Info Needed',
}

export enum AuditStage {
    Stage1 = 'Stage 1 Audit',
    Stage2 = 'Stage 2 Audit',
    FirstSurveillance = '1st Surveillance',
    SecondSurveillance = '2nd Surveillance',
    Recertification = 'Re-certification',
}

export enum MeetingType {
    Opening = 'Opening Meeting',
    Online = 'Online Audit',
    Personnel = 'Personnel Interviews',
    Management = 'Top Management Interviews',
    Closing = 'Closing Meeting',
}

export interface Meeting {
  id: string;
  type: MeetingType;
  dateTime: string; // ISO string
  duration: number; // in minutes
  meetingLink: string;
  notes: string;
  readByClient: boolean;
}

export interface Clause {
  id: string;
  title: string;
  description: string;
  isCustom?: boolean;
  section?: string;
}

export interface ISOStandard {
  id: ISOStandardID;
  name:string;
  clauses: Clause[];
}

export interface WorkflowStage {
  stage: AuditStage;
  clauses: Clause[];
}

export interface Workflow {
  id: ISOStandardID;
  name: string;
  stages: WorkflowStage[];
}

export interface ClauseStatus {
  clauseId: string;
  uploadedFiles?: { name: string; type: string; size: number; dataUrl?: string }[];
  notes: string;
  findings: string;
  aiSuggestions?: string[];
  auditorStatus: AuditorStatus;
}

export enum ClientStatus {
    InProgress = 'In-progress',
    Valid = 'Valid',
    Suspended = 'Suspended',
    Revoked = 'Revoked',
    Withdrawn = 'Withdrawn',
    PendingTechnicalReview = 'Pending Technical Review',
    ActionRequired = 'Action Required',
    CorrectiveActionPendingReview = 'Corrective Action Pending Review',
    CorrectiveActionApproved = 'Corrective Action Approved',
}

export interface AuditorDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  uploadDate: string; // ISO string
}

export enum AuditorRecommendation {
    CertifyAfterReview = 'Recommend Certification after Technical Review',
    CertifyWithPending = 'Recommend Certification (Pending)',
    Defer = 'Recommend Deferral',
}

export enum AuditorSubRecommendation {
    CAP = 'Corrective Action Plan',
    MajorNCClosure = 'Closure of Major NC\'s',
}

export interface GeneralNote {
  id: string;
  content: string;
  author: 'auditor';
  createdAt: string; // ISO string
  readByClient: boolean;
}

export interface StageDocuments {
  stage: AuditStage;
  documents: AuditorDocument[];
}

export interface SignatureMetadata {
  ipAddress: string;
  timestamp: string; // ISO string
  signerName: string;
}

export interface CertificationDecisionData {
  answers: {
    reportFiled: 'Yes' | 'No';
    ncReportFiled: 'Yes' | 'No' | 'N/A';
    majorNcImplemented: 'Yes' | 'No' | 'N/A';
    minorNcAccepted: 'Yes' | 'No' | 'N/A';
    appReviewFiled: 'Yes' | 'No' | 'N/A';
    objectiveAchieved: 'Yes' | 'No';
    scopeVerified: 'Yes' | 'No' | 'N/A';
  };
  decision: 'Granted' | 'Not Granted';
  decisionDate: string; // ISO string
  signatureMetadata?: SignatureMetadata;
}

export interface ActionItem {
    id: string;
    title: string;
    description: string;
    senderRole: string;
    senderName: string;
    priority: 'High' | 'Medium' | 'Low';
    dueDate?: string;
    status: 'Open' | 'In Review' | 'Closed';
    attachments: AuditorDocument[];
    clientResponse?: string;
    clientResponseDocuments?: AuditorDocument[];
    responseDate?: string;
    createdAt: string;
}

export interface Audit {
  id: string;
  clientName: string;
  clientAddress: string;
  clientLogo?: string; // base64 string
  clientRepName?: string;
  clientRepEmail?: string;
  clientRepTitle?: string;
  assignedAuditor: string;
  dueDate: string;
  standardId: ISOStandardID;
  currentStage: AuditStage;
  customClauses: Clause[]; // For auditor-added questions
  clauseOrder?: string[]; // To store custom ordering
  createdAt: string;
  statuses: ClauseStatus[];
  meetings?: Meeting[];
  generalNotes?: GeneralNote[];
  status: ClientStatus;
  scope?: string;
  iafCodes?: string[];
  certificateNumber?: string;
  auditorDocuments?: AuditorDocument[];
  technicalReviewDocuments?: AuditorDocument[];
  auditorRecommendation?: AuditorRecommendation;
  auditorSubRecommendation?: AuditorSubRecommendation;
  stageDocuments?: StageDocuments[];
  certificationDecisionData?: CertificationDecisionData;
  certificationDecisionReport?: string; // base64 data url
  actionItems?: ActionItem[];
}

export type UserRole = 'client' | 'auditor' | 'administrator' | 'technical_reviewer' | 'application_reviewer' | 'admin';

export interface KnowledgeBaseVideo {
  id: string;
  title: string;
  url: string;
  embedUrl: string;
}

export interface KnowledgeBaseDocument {
  id: string;
  title: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  uploadDate: string; // ISO string
}

export interface ApplicableStandards {
  iso17021: boolean;
  iso17020: boolean;
  iso17024: boolean;
  iso17029: boolean;
  generalSystem: boolean;
}

export interface ApplicationReview {
  id: string;
  // Header Info
  documentNo: string;
  issueRevisionNo: string;
  releaseDate: string;
  // Main Info
  companyName: string;
  date: string;
  auditCycle: 'Initial Audit' | 'Re-certification' | null;
  applicableStandards: ApplicableStandards;
  // Review Questions (true for YES, false for NO)
  infoSufficient: boolean | null;
  misunderstandingResolved: boolean | null;
  canPerformActivity: boolean | null;
  scopeConsidered: boolean | null;
  integratedSystem: boolean | null;
  outsourcedPersonnelConsidered: boolean | null;
  // Details
  integrationLevel: number | null;
  totalPersonnel: string;
  minManDays: string;
  iafCodesJustification: string[];
  integratedStandards: string[];
  // Decision
  decision: 'Application Approved' | 'Application Declined' | null;
  auditAssignedTo: string[];
  createdAt: string;
  pdfDataUri: string | null;
  signatureMetadata?: SignatureMetadata;
}

// --- Form Builder Types ---

export type FormElementType = 
  | 'text' 
  | 'textarea' 
  | 'email' 
  | 'phone' 
  | 'url' 
  | 'date' 
  | 'dropdown' 
  | 'checkbox' 
  | 'radio' 
  | 'image' 
  | 'signature' 
  | 'button';

export interface FormElement {
  id: string;
  type: FormElementType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  required?: boolean;
  options?: string[]; // For dropdown, radio, checkbox
  value?: string; // Default value
  placeholder?: string;
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  backgroundDataUrl: string | null; // PDF or Image base64
  backgroundType: 'pdf' | 'image' | null;
  elements: FormElement[];
  createdAt: string;
  updatedAt: string;
}
