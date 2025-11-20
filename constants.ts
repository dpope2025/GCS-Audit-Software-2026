
import { ISOStandard, Auditor, AuditorStatus, Workflow, AuditStage, Clause, Audit, ClientStatus } from './types';

export enum ISOStandardID {
  ISO9001 = 'ISO 9001:2015',
  ISO14001 = 'ISO 14001:2015',
  ISO45001 = 'ISO 45001:2018',
  IMS = 'IMS 9001, 14001, 45001',
}

const iso9001Clauses: Clause[] = [
      { id: '4.1', title: 'Context of the Organization', description: 'Understanding the organization and its context.' },
      { id: '4.2', title: 'Needs and Expectations of Interested Parties', description: 'Understanding the needs and expectations of interested parties.' },
      { id: '4.3', title: 'Scope of the QMS', description: 'Determining the scope of the quality management system.' },
      { id: '4.4', title: 'Quality Management System and its Processes', description: 'Ensuring the QMS and its processes are established, implemented, maintained, and continually improved.' },
      { id: '5.1', title: 'Leadership and Commitment', description: 'Top management shall demonstrate leadership and commitment with respect to the QMS.' },
      { id: '5.2', title: 'Policy', description: 'Establishing the quality policy.' },
      { id: '5.3', title: 'Organizational Roles, Responsibilities and Authorities', description: 'Ensuring roles, responsibilities, and authorities are assigned, communicated, and understood.' },
      { id: '6.1', title: 'Actions to Address Risks and Opportunities', description: 'Planning to address risks and opportunities.' },
      { id: '6.2', title: 'Quality Objectives and Planning to Achieve Them', description: 'Setting and planning to achieve quality objectives.' },
      { id: '6.3', title: 'Planning of Changes', description: 'Planning changes to the QMS.' },
      { id: '7.1', title: 'Resources', description: 'Determining and providing necessary resources.' },
      { id: '7.2', title: 'Competence', description: 'Ensuring competence of personnel.' },
      { id: '7.3', title: 'Awareness', description: 'Ensuring personnel are aware of the quality policy, objectives, and their contribution.' },
      { id: '7.4', title: 'Communication', description: 'Determining internal and external communications.' },
      { id: '7.5', title: 'Documented Information', description: 'Creating, updating, and controlling documented information.' },
      { id: '8.1', title: 'Operational Planning and Control', description: 'Planning, implementing, and controlling processes needed to meet requirements.' },
      { id: '8.2', title: 'Requirements for Products and Services', description: 'Determining requirements for products and services.' },
      { id: '8.3', title: 'Design and Development of Products and Services', description: 'Establishing, implementing, and maintaining a design and development process.' },
      { id: '8.4', title: 'Control of Externally Provided Processes, Products and Services', description: 'Ensuring control over external providers.' },
      { id: '8.5', title: 'Production and Service Provision', description: 'Controlling production and service provision.' },
      { id: '8.6', title: 'Release of Products and Services', description: 'Implementing planned arrangements to verify that requirements have been met.' },
      { id: '8.7', title: 'Control of Nonconforming Outputs', description: 'Ensuring nonconforming outputs are identified and controlled.' },
      { id: '9.1', title: 'Monitoring, Measurement, Analysis and Evaluation', description: 'Determining what needs to be monitored and measured.' },
      { id: '9.2', title: 'Internal Audit', description: 'Conducting internal audits at planned intervals.' },
      { id: '9.3', title: 'Management Review', description: 'Top management shall review the QMS at planned intervals.' },
      { id: '10.1', title: 'General (Improvement)', description: 'Determining and selecting opportunities for improvement.' },
      { id: '10.2', title: 'Nonconformity and Corrective Action', description: 'Reacting to nonconformities and taking corrective action.' },
      { id: '10.3', title: 'Continual Improvement', description: 'Continually improving the suitability, adequacy, and effectiveness of the QMS.' },
];

const iso14001Clauses: Clause[] = [
    { id: '4.1', title: 'Context of the Organization', description: 'Understanding the organization and its context regarding environmental issues.' },
    { id: '4.2', title: 'Needs and Expectations of Interested Parties', description: 'Understanding the environmental needs and expectations of interested parties.' },
    { id: '4.3', title: 'Scope of the EMS', description: 'Determining the scope of the environmental management system.' },
    { id: '5.1', title: 'Leadership and Commitment', description: 'Top management leadership and commitment for the EMS.' },
    { id: '6.1.2', title: 'Environmental Aspects', description: 'Identifying environmental aspects of activities, products, and services.' },
    { id: '6.1.3', title: 'Compliance Obligations', description: 'Determining and having access to compliance obligations.' },
    { id: '8.1', title: 'Operational Planning and Control', description: 'Planning, implementing, and controlling processes to meet environmental requirements.' },
    // FIX: Corrected object key to `title` to conform to the Clause type.
    { id: '8.2', title: 'Emergency Preparedness and Response', description: 'Preparing for and responding to potential emergency situations.' },
    { id: '9.1.1', title: 'Monitoring, Measurement, Analysis and Evaluation', description: 'Monitoring and measuring environmental performance.' },
    { id: '10.3', title: 'Continual Improvement', description: 'Continually improving the EMS to enhance environmental performance.' },
];

const iso45001Clauses: Clause[] = [
    { id: '4.1', title: 'Context of the Organization', description: 'Understanding the organization and its OH&S context.' },
    { id: '4.2', title: 'Needs and Expectations of Workers and Other Interested Parties', description: 'Understanding needs and expectations of workers and other interested parties.' },
    { id: '5.1', title: 'Leadership and Worker Participation', description: 'Demonstrating leadership and commitment with respect to the OH&S management system.' },
    { id: '5.4', title: 'Consultation and Participation of Workers', description: 'Establishing, implementing and maintaining processes for consultation and participation of workers.' },
    { id: '6.1.2', title: 'Hazard Identification and Assessment of Risks and Opportunities', description: 'Identifying hazards and assessing OH&S risks and other risks to the OH&S management system.' },
    { id: '8.1.2', title: 'Eliminating Hazards and Reducing OH&S Risks', description: 'Implementing a hierarchy of controls to eliminate hazards and reduce OH&S risks.' },
    // FIX: Corrected object key to `title` to conform to the Clause type.
    { id: '8.2', title: 'Emergency Preparedness and Response', description: 'Planning and preparing for potential emergency situations.' },
    { id: '9.2', title: 'Internal Audit', description: 'Conducting internal audits to provide information on whether the OH&S management system conforms to requirements.' },
    { id: '10.2', title: 'Incident, Nonconformity and Corrective Action', description: 'Reacting to incidents and nonconformities, and taking corrective action.' },
    { id: '10.3', title: 'Continual Improvement', description: 'Continually improving the suitability, adequacy and effectiveness of the OH&S management system.' },
];


export const ISO_STANDARDS: ISOStandard[] = [
  {
    id: ISOStandardID.ISO9001,
    name: 'ISO 9001:2015 - Quality Management System',
    clauses: iso9001Clauses,
  },
  {
    id: ISOStandardID.ISO14001,
    name: 'ISO 14001:2015 - Environmental Management System',
    clauses: iso14001Clauses,
  },
  {
    id: ISOStandardID.ISO45001,
    name: 'ISO 45001:2018 - Occupational Health & Safety',
    clauses: iso45001Clauses,
  },
  {
    id: ISOStandardID.IMS,
    name: 'IMS - Integrated Management System',
    clauses: [
      { id: '4.1', title: 'Context of the Organization', description: 'Understanding the organization and its context for Quality, Environmental, and OH&S.' },
      { id: '4.2', title: 'Needs and Expectations of Interested Parties', description: 'Understanding the needs and expectations of interested parties, including workers, for QMS, EMS, and OH&S.' },
      { id: '4.3', title: 'Scope of the Management System', description: 'Determining the scope of the integrated management system.' },
      { id: '4.4', title: 'Integrated Management System and its Processes', description: 'Ensuring the IMS and its processes are established, implemented, maintained, and continually improved.' },
      { id: '5.1', title: 'Leadership, Commitment, and Worker Participation', description: 'Top management shall demonstrate leadership, commitment, and ensure worker participation.' },
      { id: '5.2', title: 'Policy', description: 'Establishing the integrated quality, environmental, and OH&S policy.' },
      { id: '5.3', title: 'Organizational Roles, Responsibilities and Authorities', description: 'Ensuring roles, responsibilities, and authorities are assigned, communicated, and understood.' },
      { id: '5.4', title: 'Consultation and Participation of Workers', description: 'Establishing processes for consultation and participation of workers in the OH&S management system.' },
      { id: '6.1', title: 'Actions to Address Risks and Opportunities', description: 'Planning to address risks and opportunities related to QMS, environmental aspects, and OH&S hazards.' },
      { id: '6.2', title: 'Objectives and Planning to Achieve Them', description: 'Setting and planning to achieve integrated objectives.' },
      { id: '6.3', title: 'Planning of Changes', description: 'Planning changes to the IMS.' },
      { id: '7.1', title: 'Resources', description: 'Determining and providing necessary resources for the IMS.' },
      { id: '7.2', title: 'Competence', description: 'Ensuring competence of personnel.' },
      // FIX: Corrected object key to `title` to conform to the Clause type.
      { id: '7.3', title: 'Awareness', description: 'Ensuring personnel are aware of the integrated policy, objectives, and their contribution.' },
      { id: '7.4', title: 'Communication', description: 'Determining internal and external communications relevant to the IMS.' },
      { id: '7.5', title: 'Documented Information', description: 'Creating, updating, and controlling documented information for the IMS.' },
      { id: '8.1', title: 'Operational Planning and Control', description: 'Planning, implementing, and controlling processes needed to meet integrated requirements, including eliminating hazards.' },
      // FIX: Corrected object key to `title` to conform to the Clause type.
      { id: '8.2', title: 'Emergency Preparedness and Response', description: 'Preparing for and responding to potential emergency situations (Environmental & OH&S).' },
      { id: '9.1', title: 'Monitoring, Measurement, Analysis and Evaluation', description: 'Determining what needs to be monitored and measured for quality performance, environmental performance, and OH&S.' },
      { id: '9.2', title: 'Internal Audit', description: 'Conducting internal audits of the IMS at planned intervals.' },
      { id: '9.3', title: 'Management Review', description: 'Top management shall review the IMS at planned intervals.' },
      { id: '10.1', title: 'General (Improvement)', description: 'Determining and selecting opportunities for improvement.' },
      { id: '10.2', title: 'Nonconformity, Corrective Action, and Incidents', description: 'Reacting to nonconformities, incidents and taking corrective action.' },
      { id: '10.3', title: 'Continual Improvement', description: 'Continually improving the suitability, adequacy, and effectiveness of the IMS.' },
    ]
  }
];

export const ALL_AUDIT_STAGES: AuditStage[] = [
    AuditStage.Stage1,
    AuditStage.Stage2,
    AuditStage.FirstSurveillance,
    AuditStage.SecondSurveillance,
    AuditStage.Recertification,
];

const STAGE_1_DEFAULT_CLAUSES: Clause[] = [
    { id: 'Q-1', title: 'Management System Manual/s', description: 'Upload any Manual/s related to the scope of your management system.' },
    { id: 'Q-2', title: 'Policies', description: 'Upload any Policies related to the scope of your management system.' },
    { id: 'Q-3', title: 'Procedures', description: 'Upload any additional Procedures related to the scope of your management system.' },
    { id: 'Q-4', title: 'Organizational Chart', description: 'Upload the latest Organizational Chart, identifying "Names" of key staff members and their roles.' },
    { id: 'Q-5', title: 'Management Review', description: 'Upload the results of the last Management Review Conducted.' },
    { id: 'Q-6', title: 'Internal Audit/s', description: 'Upload the results of the last Internal Audit/s Conducted.' },
    { id: 'Q-7', title: 'Company Information', description: 'Upload any company profiles/ brochures etc.' },
];

const iso9001FirstSurveillanceClauses: Clause[] = [
    { id: '4.1', title: 'Context of the Organization', description: 'Understanding the organization and its context.' },
    { id: '4.2', title: 'Needs and Expectations of Interested Parties', description: 'Understanding the needs and expectations of interested parties.' },
    { id: '5.1', title: 'Leadership and Commitment', description: 'Top management shall demonstrate leadership and commitment with respect to the QMS.' },
    { id: '6.1', title: 'Actions to Address Risks and Opportunities', description: 'Planning to address risks and opportunities.' },
    { id: '6.2', title: 'Quality Objectives and Planning to Achieve Them', description: 'Setting and planning to achieve quality objectives.' },
    { id: '7.3', title: 'Awareness', description: 'Ensuring personnel are aware of the quality policy, objectives, and their contribution.' },
    { id: '7.4', title: 'Communication', description: 'Determining internal and external communications.' },
    { id: '7.5', title: 'Documented Information', description: 'Creating, updating, and controlling documented information.' },
    { id: '8.1', title: 'Operational Planning and Control', description: 'Planning, implementing, and controlling processes needed to meet requirements.' },
    { id: '8.3', title: 'Design and Development of Products and Services', description: 'Establishing, implementing, and maintaining a design and development process.' },
    { id: '8.7', title: 'Control of Nonconforming Outputs', description: 'Ensuring nonconforming outputs are identified and controlled.' },
    { id: '9.2', title: 'Internal Audit', description: 'Conducting internal audits at planned intervals.' },
    { id: '9.3', title: 'Management Review', description: 'Top management shall review the QMS at planned intervals.' },
    { id: '10.2', title: 'Nonconformity and Corrective Action', description: 'Reacting to nonconformities and taking corrective action.' },
    { id: '10.3', title: 'Continual Improvement', description: 'Continually improving the suitability, adequacy, and effectiveness of the QMS.' },
];

const iso9001SecondSurveillanceClauses: Clause[] = [
    { id: '4.3', title: 'Scope of the QMS', description: 'Determining the scope of the quality management system.' },
    { id: '4.4', title: 'Quality Management System and its Processes', description: 'Ensuring the QMS and its processes are established, implemented, maintained, and continually improved.' },
    { id: '5.2', title: 'Policy', description: 'Establishing the quality policy.' },
    { id: '5.3', title: 'Organizational Roles, Responsibilities and Authorities', description: 'Ensuring roles, responsibilities, and authorities are assigned, communicated, and understood.' },
    { id: '6.1', title: 'Actions to Address Risks and Opportunities', description: 'Planning to address risks and opportunities.' },
    { id: '6.3', title: 'Planning of Changes', description: 'Planning changes to the QMS.' },
    { id: '7.1', title: 'Resources', description: 'Determining and providing necessary resources.' },
    { id: '7.2', title: 'Competence', description: 'Ensuring competence of personnel.' },
    { id: '8.2', title: 'Requirements for Products and Services', description: 'Determining requirements for products and services.' },
    { id: '8.4', title: 'Control of Externally Provided Processes, Products and Services', description: 'Ensuring control over external providers.' },
    { id: '8.5', title: 'Production and Service Provision', description: 'Controlling production and service provision.' },
    { id: '8.6', title: 'Release of Products and Services', description: 'Implementing planned arrangements to verify that requirements have been met.' },
    { id: '9.1', title: 'Monitoring, Measurement, Analysis and Evaluation', description: 'Determining what needs to be monitored and measured.' },
    { id: '9.2', title: 'Internal Audit', description: 'Conducting internal audits at planned intervals.' },
    { id: '9.3', title: 'Management Review', description: 'Top management shall review the QMS at planned intervals.' },
    { id: '10.1', title: 'General (Improvement)', description: 'Determining and selecting opportunities for improvement.' },
    { id: '10.2', title: 'Nonconformity and Corrective Action', description: 'Reacting to nonconformities and taking corrective action.' },
    { id: '10.3', title: 'Continual Improvement', description: 'Continually improving the suitability, adequacy, and effectiveness of the QMS.' },
];

export const INITIAL_WORKFLOWS: Workflow[] = ISO_STANDARDS.map(standard => ({
    id: standard.id,
    name: standard.name,
    stages: ALL_AUDIT_STAGES.map(stage => {
        let clausesForStage: Clause[];
        if (stage === AuditStage.Stage1) {
            clausesForStage = STAGE_1_DEFAULT_CLAUSES;
        } else if (standard.id === ISOStandardID.ISO9001 && stage === AuditStage.FirstSurveillance) {
            clausesForStage = iso9001FirstSurveillanceClauses;
        } else if (standard.id === ISOStandardID.ISO9001 && stage === AuditStage.SecondSurveillance) {
            clausesForStage = iso9001SecondSurveillanceClauses;
        } else {
            clausesForStage = standard.clauses;
        }
        return {
            stage: stage,
            clauses: JSON.parse(JSON.stringify(clausesForStage)),
        };
    }),
}));

export const AUDITOR_APPROVAL_CODES: string[] = [
    'ISO 9001:2015',
    'ISO 14001:2015',
    'ISO 45001:2018',
    'ISO 29001:2020',
    'ISO 10855',
    'ESG'
];

export const INITIAL_AUDITORS: Auditor[] = [
    {
        name: 'John Doe',
        email: 'john.doe@gcs.com',
        photo: 'https://i.pravatar.cc/150?u=john.doe',
        approvedCodes: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018'],
    }
];

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 30);
const futureDate2 = new Date();
futureDate2.setDate(futureDate2.getDate() + 60);
const futureDate3 = new Date();
futureDate3.setDate(futureDate3.getDate() + 90);
const futureDate4 = new Date();
futureDate4.setDate(futureDate4.getDate() + 120);
const futureDate5 = new Date();
futureDate5.setDate(futureDate5.getDate() + 150);


const iso9001Workflow = INITIAL_WORKFLOWS.find(w => w.id === ISOStandardID.ISO9001);

const iso9001Stage1Clauses = iso9001Workflow?.stages.find(s => s.stage === AuditStage.Stage1)?.clauses || [];
const initialClauseOrder = iso9001Stage1Clauses.map(c => c.id);

const iso9001FullWorkflowClauses = iso9001Workflow?.stages.find(s => s.stage === AuditStage.Stage2)?.clauses || [];
const fullClauseOrder = iso9001FullWorkflowClauses.map(c => c.id);
const fullInitialStatuses = iso9001FullWorkflowClauses.map(clause => ({
  clauseId: clause.id,
  notes: '',
  findings: '',
  uploadedFiles: [],
  auditorStatus: AuditorStatus.NotStarted,
}));

const iso9001FirstSurveillanceWorkflowClauses = iso9001Workflow?.stages.find(s => s.stage === AuditStage.FirstSurveillance)?.clauses || [];
const firstSurveillanceClauseOrder = iso9001FirstSurveillanceWorkflowClauses.map(c => c.id);
const firstSurveillanceInitialStatuses = iso9001FirstSurveillanceWorkflowClauses.map(clause => ({
  clauseId: clause.id,
  notes: '',
  findings: '',
  uploadedFiles: [],
  auditorStatus: AuditorStatus.NotStarted,
}));

const iso9001SecondSurveillanceWorkflowClauses = iso9001Workflow?.stages.find(s => s.stage === AuditStage.SecondSurveillance)?.clauses || [];
const secondSurveillanceClauseOrder = iso9001SecondSurveillanceWorkflowClauses.map(c => c.id);
const secondSurveillanceInitialStatuses = iso9001SecondSurveillanceWorkflowClauses.map(clause => ({
  clauseId: clause.id,
  notes: '',
  findings: '',
  uploadedFiles: [],
  auditorStatus: AuditorStatus.NotStarted,
}));


export const INITIAL_AUDITS: Audit[] = [
  {
    id: 'demo-audit-01',
    clientName: 'Innovatech Solutions',
    clientAddress: '123 Tech Park, Silicon Valley, CA 94107',
    clientLogo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwNTJDQyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMiAyTDIgN3YxMGwxMCA1IDEwLTUgVjdsLTEwLTUiLz48cGF0aCBkPSJNMjIgN0wxMiAxMiAyIDciLz48cGF0aCBkPSJNMTIgMnYxMCIvPjwvc3ZnPg==',
    clientRepName: 'Jane Smith',
    clientRepEmail: 'jane.smith@innovatech.com',
    clientRepTitle: 'Quality Assurance Manager',
    assignedAuditor: 'John Doe',
    dueDate: futureDate.toISOString(),
    standardId: ISOStandardID.ISO9001,
    currentStage: AuditStage.Stage1,
    status: ClientStatus.InProgress,
    scope: 'Design and development of custom software solutions for the tech industry.',
    iafCodes: ['33'],
    certificateNumber: 'GCS-QMS-001',
    customClauses: [],
    clauseOrder: initialClauseOrder,
    createdAt: new Date().toISOString(),
    meetings: [],
    generalNotes: [],
    statuses: iso9001Stage1Clauses.map(clause => ({
      clauseId: clause.id,
      notes: '',
      findings: '',
      uploadedFiles: [],
      auditorStatus: AuditorStatus.NotStarted,
    })),
    auditorDocuments: [],
    technicalReviewDocuments: [],
    stageDocuments: [],
  },
  {
    id: 'demo-audit-02',
    clientName: 'Quantum Dynamics',
    clientAddress: '456 Innovation Ave, Tech City, TX 75001',
    clientLogo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwNTJDQyIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjIiLz48ZWxsaXBzZSBjeD0iMTIiIGN5PSIxMiIgcng9IjEwIiByeT0iNCIvPjxlbGxpcHNlIGN4PSIxMiIgY3k9IjEyIiByeD0iNCIgcnk9IjEwIi8+PC9zdmc+',
    clientRepName: 'Alex Johnson',
    clientRepEmail: 'alex.j@quantumdynamics.com',
    assignedAuditor: 'John Doe',
    dueDate: futureDate2.toISOString(),
    standardId: ISOStandardID.ISO9001,
    currentStage: AuditStage.Stage2,
    status: ClientStatus.InProgress,
    scope: '',
    iafCodes: [],
    certificateNumber: '',
    customClauses: [],
    clauseOrder: fullClauseOrder,
    createdAt: new Date().toISOString(),
    meetings: [],
    generalNotes: [],
    statuses: fullInitialStatuses,
    auditorDocuments: [],
    technicalReviewDocuments: [],
    stageDocuments: [],
  },
  {
    id: 'demo-audit-03',
    clientName: 'Stellar Solutions',
    clientAddress: '789 Galaxy Way, Orbit City, FL 32899',
    clientLogo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwNTJDQyIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjIuNSIvPjxwYXRoIGQ9Ik0xMiAyYTEwIDQuNSAwIDEgMCAwIC4xIi8+PHBhdGggZD0iTTIyIDEyYTQuNSAxMCAwIDEgMC0uMSAwIi8+PC9zdmc+',
    clientRepName: 'Maria Garcia',
    clientRepEmail: 'maria.g@stellarsolutions.com',
    assignedAuditor: 'John Doe',
    dueDate: futureDate3.toISOString(),
    standardId: ISOStandardID.ISO9001,
    currentStage: AuditStage.FirstSurveillance,
    status: ClientStatus.InProgress,
    scope: '',
    iafCodes: [],
    certificateNumber: '',
    customClauses: [],
    clauseOrder: firstSurveillanceClauseOrder,
    createdAt: new Date().toISOString(),
    meetings: [],
    generalNotes: [],
    statuses: firstSurveillanceInitialStatuses,
    auditorDocuments: [],
    technicalReviewDocuments: [],
    stageDocuments: [],
  },
  {
    id: 'demo-audit-04',
    clientName: 'Nexus Enterprises',
    clientAddress: '101 Connect Blvd, Hubsfield, MA 01002',
    clientLogo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwNTJDQyIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiLz48cGF0aCBkPSJNMTIgMnYybTAgMTZ2Mk00LjkzIDQuOTNsMS40MSAxLjQxbTExLjMyIDExLjMybDEuNDEgMS40MU0yIDEyaDJtMTYgMGgybS0yLjgzLTcuMDdsLTEuNDEtMS40MU0xOS4wNyAxOS4wN2wtMS40MS0xLjQxIi8+PC9zdmc+',
    clientRepName: 'David Chen',
    clientRepEmail: 'd.chen@nexus.com',
    assignedAuditor: 'John Doe',
    dueDate: futureDate4.toISOString(),
    standardId: ISOStandardID.ISO9001,
    currentStage: AuditStage.SecondSurveillance,
    status: ClientStatus.InProgress,
    scope: '',
    iafCodes: [],
    certificateNumber: '',
    customClauses: [],
    clauseOrder: secondSurveillanceClauseOrder,
    createdAt: new Date().toISOString(),
    meetings: [],
    generalNotes: [],
    statuses: secondSurveillanceInitialStatuses,
    auditorDocuments: [],
    technicalReviewDocuments: [],
    stageDocuments: [],
  },
  {
    id: 'demo-audit-05',
    clientName: 'Apex Innovations',
    clientAddress: '21 Summit Peak, Crestview, CO 80014',
    clientLogo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwNTJDQyIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIGQ9Im04IDMgNCA4IDUtNSA1IDE1SDJMOCAz eiIvPjwvc3ZnPg==',
    clientRepName: 'Sarah Lee',
    clientRepEmail: 's.lee@apexinnovations.com',
    assignedAuditor: 'John Doe',
    dueDate: futureDate5.toISOString(),
    standardId: ISOStandardID.ISO9001,
    currentStage: AuditStage.Recertification,
    status: ClientStatus.InProgress,
    scope: '',
    iafCodes: [],
    certificateNumber: '',
    customClauses: [],
    clauseOrder: fullClauseOrder,
    createdAt: new Date().toISOString(),
    meetings: [],
    generalNotes: [],
    statuses: fullInitialStatuses,
    auditorDocuments: [],
    technicalReviewDocuments: [],
    stageDocuments: [],
  }
];

export const AUDITOR_STATUS_CONFIG: { [key in AuditorStatus]: { label: string; colors: string } } = {
    [AuditorStatus.NotStarted]: { label: 'Not Started', colors: 'bg-gray-100 text-gray-500' },
    [AuditorStatus.Pending]: { label: 'Pending Review', colors: 'bg-blue-100 text-blue-800' },
    [AuditorStatus.Accepted]: { label: 'Accepted', colors: 'bg-green-100 text-green-800' },
    [AuditorStatus.MinorNC]: { label: 'Minor NC', colors: 'bg-yellow-100 text-yellow-800' },
    [AuditorStatus.MajorNC]: { label: 'Major NC', colors: 'bg-red-100 text-red-800' },
    [AuditorStatus.InfoNeeded]: { label: 'Info Needed', colors: 'bg-purple-100 text-purple-800' },
};

export const CLIENT_STATUS_CONFIG: { [key in ClientStatus]: { label: string; colors: string } } = {
    [ClientStatus.InProgress]: { label: 'In-progress', colors: 'bg-yellow-100 text-yellow-800' },
    [ClientStatus.Valid]: { label: 'Valid', colors: 'bg-green-100 text-green-800' },
    [ClientStatus.Suspended]: { label: 'Suspended', colors: 'bg-orange-200 text-orange-800' },
    [ClientStatus.Revoked]: { label: 'Revoked', colors: 'bg-red-100 text-red-800' },
    [ClientStatus.Withdrawn]: { label: 'Withdrawn', colors: 'bg-gray-200 text-gray-800' },
    [ClientStatus.PendingTechnicalReview]: { label: 'Pending Technical Review', colors: 'bg-indigo-100 text-indigo-800' },
    [ClientStatus.ActionRequired]: { label: 'Action Required', colors: 'bg-red-100 text-red-800' },
    [ClientStatus.CorrectiveActionPendingReview]: { label: 'Pending Review', colors: 'bg-yellow-100 text-yellow-800' },
    [ClientStatus.CorrectiveActionApproved]: { label: 'Approved', colors: 'bg-green-100 text-green-800' },
};

export const IAF_CODES: { code: string; description: string }[] = [
    { code: '1', description: 'Agriculture, forestry and fishing' },
    { code: '2', description: 'Mining and quarrying' },
    { code: '3', description: 'Food products, beverages and tobacco' },
    { code: '4', description: 'Textiles and textile products' },
    { code: '5', description: 'Leather and leather products' },
    { code: '6', description: 'Wood and wood products' },
    { code: '7', description: 'Pulp, paper and paper products' },
    { code: '8', description: 'Publishing companies' },
    { code: '9', description: 'Printing companies' },
    { code: '10', description: 'Manufacture of coke and refined petroleum products' },
    { code: '11', description: 'Nuclear fuel' },
    { code: '12', description: 'Chemicals, chemical products and fibres' },
    { code: '13', description: 'Pharmaceuticals' },
    { code: '14', description: 'Rubber and plastic products' },
    { code: '15', description: 'Non-metallic mineral products' },
    { code: '16', description: 'Concrete, cement, lime, plaster etc' },
    { code: '17', description: 'Basic metals and fabricated metal products' },
    { code: '18', description: 'Machinery and equipment' },
    { code: '19', description: 'Electrical and optical equipment' },
    { code: '20', description: 'Shipbuilding' },
    { code: '21', description: 'Aerospace' },
    { code: '22', description: 'Other transport equipment' },
    { code: '23', description: 'Manufacturing not elsewhere classified' },
    { code: '24', description: 'Recycling' },
    { code: '25', description: 'Electricity supply' },
    { code: '26', description: 'Gas supply' },
    { code: '27', description: 'Water supply' },
    { code: '28', description: 'Construction' },
    { code: '29', description: 'Wholesale and retail trade; repair of motor vehicles, motorcycles and personal and household goods' },
    { code: '30', description: 'Hotels and restaurants' },
    { code: '31', description: 'Transport, storage and communication' },
    { code: '32', description: 'Financial intermediation, real estate, renting' },
    { code: '33', description: 'Information technology' },
    { code: '34', description: 'Engineering services' },
    { code: '35', description: 'Other services' },
    { code: '36', description: 'Public administration' },
    { code: '37', description: 'Education' },
    { code: '38', description: 'Health and social work' },
    { code: '39', description: 'Other social services' },
];

export const QMS_ACCREDITATION_SCOPES: { code: string, description: string }[] = [
    { code: "QMS-01", description: "Quality Management System - ISO 9001" },
    { code: "EMS-01", description: "Environmental Management System - ISO 14001" },
    { code: "OHS-01", description: "Occupational Health & Safety - ISO 45001" },
    { code: "ISMS-01", description: "Information Security Management System - ISO 27001" },
    { code: "FSMS-01", description: "Food Safety Management System - ISO 22000" },
    { code: "AER-01", description: "Aerospace Quality Management - AS9100" },
    { code: "AUT-01", description: "Automotive Quality Management - IATF 16949" },
    { code: "MED-01", description: "Medical Devices Quality Management - ISO 13485" }
];

export const INTEGRATED_MANAGEMENT_SYSTEM_STANDARDS: { code: string, description: string }[] = [
    { code: "9001", description: "ISO 9001 - Quality Management" },
    { code: "14001", description: "ISO 14001 - Environmental Management" },
    { code: "45001", description: "ISO 45001 - Occupational Health & Safety" },
    { code: "18788", description: "ISO 18788 - Security Operations Management" },
    { code: "10855", description: "ISO 10855 - Offshore container design" },
    { code: "29001", description: "ISO 29001 - Petroleum, petrochemical and natural gas industries" },
];