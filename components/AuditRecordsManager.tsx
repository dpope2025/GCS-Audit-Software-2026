
import React, { useState, useMemo } from 'react';
import { Audit, AuditStage, AuditorDocument } from '../types';
import { ALL_AUDIT_STAGES, ISO_STANDARDS, ISOStandardID } from '../constants';

// Icons
const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500" {...props}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 18 15 12 9 6"></polyline></svg>;
const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>;
const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;


interface AuditRecordsManagerProps {
  audits: Audit[];
  onUpdateAudit: (audit: Audit) => void;
}

const AuditRecordsManager: React.FC<AuditRecordsManagerProps> = ({ audits, onUpdateAudit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStage, setFilterStage] = useState<AuditStage | 'all'>('all');
    const [filterStandard, setFilterStandard] = useState<ISOStandardID | 'all'>('all');
    const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
    const [expandedStages, setExpandedStages] = useState<{ [key: string]: AuditStage | null }>({});
    const [uploadTarget, setUploadTarget] = useState<{ audit: Audit; stage: AuditStage } | null>(null);
    const [stagedFiles, setStagedFiles] = useState<File[]>([]);
    const [docToDelete, setDocToDelete] = useState<{ audit: Audit, stage: AuditStage, doc: AuditorDocument } | null>(null);
    const [viewingDoc, setViewingDoc] = useState<{ name: string; dataUrl: string; type: string } | null>(null);
    const [editingDoc, setEditingDoc] = useState<{ auditId: string; stage: AuditStage; docId: string } | null>(null);
    const [editedDocName, setEditedDocName] = useState('');


    const getStagesForAudit = (audit: Audit): AuditStage[] => {
        // Get all stages that already have documents.
        const existingStages = audit.stageDocuments?.map(sd => sd.stage) || [];

        // Create a Set to hold unique stages.
        // Always include the current stage, even if it has no documents yet.
        const allRelevantStages = new Set([...existingStages, audit.currentStage]);

        // Convert the Set to an array and sort it based on the predefined order.
        return Array.from(allRelevantStages).sort((a, b) => {
            return ALL_AUDIT_STAGES.indexOf(a) - ALL_AUDIT_STAGES.indexOf(b);
        });
    };

    const filteredAudits = useMemo(() => {
        return audits.filter(audit => {
            const matchesSearch = audit.clientName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStandard = filterStandard === 'all' || audit.standardId === filterStandard;
            const hasStage = getStagesForAudit(audit).some(s => audit.stageDocuments?.some(sd => sd.stage === s));
            const matchesStage = filterStage === 'all' || (hasStage && audit.stageDocuments?.some(sd => sd.stage === filterStage));
            return matchesSearch && matchesStandard && (filterStage === 'all' ? true : matchesStage);
        });
    }, [audits, searchTerm, filterStandard, filterStage]);

    const toggleClient = (clientId: string) => {
        setExpandedClientId(prevId => (prevId === clientId ? null : clientId));
    };

    const toggleStage = (clientId: string, stage: AuditStage) => {
        setExpandedStages(prev => ({
            ...prev,
            [clientId]: prev[clientId] === stage ? null : stage,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setStagedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    };

    const handleUpload = async () => {
        if (!uploadTarget || stagedFiles.length === 0) return;
        const { audit, stage } = uploadTarget;
        const newDocuments = await Promise.all(stagedFiles.map(file => new Promise<AuditorDocument>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({
                id: crypto.randomUUID(), name: file.name, type: file.type, size: file.size,
                dataUrl: reader.result as string, uploadDate: new Date().toISOString(),
            });
            reader.onerror = reject;
            reader.readAsDataURL(file);
        })));

        const updatedStageDocs = [...(audit.stageDocuments || [])];
        let stageEntry = updatedStageDocs.find(sd => sd.stage === stage);
        if (stageEntry) stageEntry.documents.push(...newDocuments);
        else updatedStageDocs.push({ stage, documents: newDocuments });
        
        onUpdateAudit({ ...audit, stageDocuments: updatedStageDocs });
        setUploadTarget(null);
        setStagedFiles([]);
    };
    
    const confirmDeleteDoc = () => {
        if (!docToDelete) return;
        const { audit, stage, doc } = docToDelete;
        const updatedStageDocs = (audit.stageDocuments || [])
            .map(sd => sd.stage === stage ? { ...sd, documents: sd.documents.filter(d => d.id !== doc.id) } : sd)
            .filter(sd => sd.documents.length > 0);
        onUpdateAudit({ ...audit, stageDocuments: updatedStageDocs });
        setDocToDelete(null);
    };

    const handleStartEdit = (audit: Audit, stage: AuditStage, doc: AuditorDocument) => {
        setEditingDoc({ auditId: audit.id, stage, docId: doc.id });
        setEditedDocName(doc.name);
    };
    
    const handleSaveEdit = () => {
        if (!editingDoc) return;
        const { auditId, stage, docId } = editingDoc;
        const auditToUpdate = audits.find(a => a.id === auditId);
        if (!auditToUpdate || !editedDocName.trim()) return;

        const updatedStageDocs = (auditToUpdate.stageDocuments || []).map(sd => sd.stage === stage ? {
            ...sd, documents: sd.documents.map(d => d.id === docId ? { ...d, name: editedDocName.trim() } : d)
        } : sd);

        onUpdateAudit({ ...auditToUpdate, stageDocuments: updatedStageDocs });
        setEditingDoc(null);
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-text-primary mb-4 border-b pb-4">Audit Records File System</h3>
            
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                <div className="flex-grow">
                    <input type="text" placeholder="Search by client name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full max-w-xs input-field text-base" />
                </div>
                <div>
                    <select value={filterStandard} onChange={(e) => setFilterStandard(e.target.value as ISOStandardID | 'all')} className="input-field h-full text-base">
                        <option value="all">All Standards</option>
                        {ISO_STANDARDS.map(std => <option key={std.id} value={std.id}>{std.id}</option>)}
                    </select>
                </div>
                <div>
                    <select value={filterStage} onChange={(e) => setFilterStage(e.target.value as AuditStage | 'all')} className="input-field h-full text-base">
                        <option value="all">All Stages</option>
                        {ALL_AUDIT_STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAudits.length > 0 ? filteredAudits.map(audit => {
                    const isClientExpanded = expandedClientId === audit.id;
                    const stages = getStagesForAudit(audit);
                    const year = new Date(audit.dueDate).getFullYear();

                    return (
                        <div key={audit.id} className="border rounded-lg bg-gray-50 overflow-hidden">
                            <div className="flex items-center gap-2 p-3 hover:bg-gray-100 cursor-pointer" onClick={() => toggleClient(audit.id)}>
                                <ChevronRightIcon className={`transition-transform transform ${isClientExpanded ? 'rotate-90' : ''}`} />
                                <FolderIcon />
                                <span className="text-lg font-semibold text-text-primary">{audit.clientName}</span>
                            </div>
                            {isClientExpanded && (
                                <div className="p-4 bg-gray-100 border-t border-l-4 border-blue-200">
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {stages.map(stage => {
                                            const stageDocuments = audit.stageDocuments?.find(sd => sd.stage === stage)?.documents || [];
                                            const isStageExpanded = expandedStages[audit.id] === stage;
                                            return (
                                                <div key={stage} className={`border rounded-lg bg-white ${isStageExpanded ? 'sm:col-span-2' : ''}`}>
                                                    <div className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50" onClick={() => toggleStage(audit.id, stage)}>
                                                        <ChevronRightIcon className={`transition-transform transform ${isStageExpanded ? 'rotate-90' : ''} h-5 w-5`} />
                                                        <FolderIcon />
                                                        <span className="font-medium text-text-secondary text-base">{`${year} - ${stage}`}</span>
                                                    </div>
                                                    {isStageExpanded && (
                                                        <div className="p-3 border-t space-y-2 bg-white border-l-4 border-yellow-200 ml-2">
                                                            {stageDocuments.map(doc => {
                                                                const isEditing = editingDoc?.docId === doc.id;
                                                                return (
                                                                    <div key={doc.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50 hover:bg-gray-100">
                                                                        <div className="flex items-center gap-3 min-w-0 flex-grow">
                                                                            <FileTextIcon/>
                                                                            {isEditing ? (
                                                                                <input type="text" value={editedDocName} onChange={e => setEditedDocName(e.target.value)} className="input-field text-base flex-grow" autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveEdit()} />
                                                                            ) : (
                                                                                <div className="min-w-0 flex-grow">
                                                                                    <p className="text-base truncate font-medium max-w-[250px]">{doc.name}</p>
                                                                                    <p className="text-sm text-gray-500">{(doc.size / 1024).toFixed(1)} KB - {new Date(doc.uploadDate).toLocaleDateString()}</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                                                            {isEditing ? (
                                                                                <>
                                                                                    <button onClick={handleSaveEdit} className="p-2 text-green-500 hover:bg-green-100 rounded-full" aria-label="Save"><CheckIcon /></button>
                                                                                    <button onClick={() => setEditingDoc(null)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full" aria-label="Cancel"><XIcon /></button>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <button onClick={() => setViewingDoc(doc)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full" aria-label="View"><EyeIcon /></button>
                                                                                    <button onClick={() => handleStartEdit(audit, stage, doc)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full" aria-label="Edit"><EditIcon /></button>
                                                                                    <a href={doc.dataUrl} download={doc.name} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full" aria-label="Download"><DownloadIcon /></a>
                                                                                    <button onClick={() => setDocToDelete({ audit, stage, doc })} className="p-2 text-red-500 hover:bg-red-100 rounded-full" aria-label="Delete"><TrashIcon /></button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                            <button onClick={() => setUploadTarget({ audit, stage })} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-md transition-colors mt-2">
                                                                <UploadIcon/> Upload
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <p className="text-center text-gray-500 py-8 col-span-full">No records match your search criteria.</p>
                )}
            </div>

            {/* Modals */}
            {uploadTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg">
                        <h3 className="text-2xl font-bold text-text-primary mb-4">Upload Documents</h3>
                        <p className="text-base text-text-secondary mb-4">
                            Uploading to: <span className="font-semibold">{uploadTarget.audit.clientName}</span> / <span className="font-semibold">{new Date(uploadTarget.audit.dueDate).getFullYear()} - {uploadTarget.stage}</span>
                        </p>
                        <div className="space-y-4">
                            <label className="w-full block text-center cursor-pointer bg-brand-secondary hover:bg-gray-200 text-text-primary font-semibold py-4 px-3 rounded-md transition-colors flex flex-col items-center justify-center gap-2 border-2 border-dashed">
                                <UploadIcon />
                                <span className="text-base truncate max-w-full px-2">{stagedFiles.length > 0 ? `${stagedFiles.length} file(s) selected` : 'Click to upload document(s)'}</span>
                                <input type="file" multiple onChange={handleFileChange} className="hidden" />
                            </label>
                            {stagedFiles.length > 0 && <ul className="mt-3 space-y-1 max-h-40 overflow-y-auto">{stagedFiles.map((file, index) => <li key={index} className="text-sm">{file.name}</li>)}</ul>}
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => { setUploadTarget(null); setStagedFiles([]); }} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                            <button onClick={handleUpload} disabled={stagedFiles.length === 0} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-accent disabled:bg-gray-400">Upload</button>
                        </div>
                    </div>
                </div>
            )}
            
            {docToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-4 text-red-600">Delete Document?</h3>
                        <p className="text-text-secondary mb-6">Are you sure you want to delete <span className="font-semibold">{docToDelete.doc.name}</span>?</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setDocToDelete(null)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                            <button onClick={confirmDeleteDoc} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            
            {viewingDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setViewingDoc(null)}>
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 className="text-2xl font-bold text-text-primary truncate pr-4">{viewingDoc.name}</h3>
                            <button onClick={() => setViewingDoc(null)} className="text-gray-500 hover:text-gray-800 text-3xl font-bold leading-none">&times;</button>
                        </div>
                        <div className="flex-grow overflow-auto">
                            {viewingDoc.type.startsWith('image/') ? (
                                <img src={viewingDoc.dataUrl} alt={viewingDoc.name} className="max-w-full h-auto mx-auto" />
                            ) : viewingDoc.type === 'application/pdf' ? (
                                <iframe src={viewingDoc.dataUrl} className="w-full h-[75vh]" title={viewingDoc.name}></iframe>
                            ) : (
                                <div className="text-center p-8">
                                    <p className="text-text-secondary">No preview available for this file type.</p>
                                </div>
                            )}
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

export default AuditRecordsManager;
