
import React, { useState, useMemo } from 'react';
import { Audit, ActionItem, UserRole, AuditorDocument, Auditor } from '../types';
import { AuditorStatus } from '../types';

// Icons
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;


interface ActionManagerProps {
    audits: Audit[];
    onUpdateAudit: (audit: Audit) => void;
    currentUser: Auditor;
    userRole: UserRole;
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const ActionManager: React.FC<ActionManagerProps> = ({ audits, onUpdateAudit, currentUser, userRole }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [actionForm, setActionForm] = useState<Partial<ActionItem>>({ priority: 'Medium' });
    const [actionFiles, setActionFiles] = useState<File[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedActionId, setExpandedActionId] = useState<string | null>(null);

    // Filter actions: Show actions created by this role OR by this specific user
    const myActions = useMemo(() => {
        const allActions: (ActionItem & { clientName: string; auditId: string })[] = [];
        
        audits.forEach(audit => {
            (audit.actionItems || []).forEach(action => {
                // Check if the action belongs to the current user's scope
                // Logic: Match role mapping
                let isMyAction = false;
                
                if (userRole === 'auditor') {
                     // Auditors see their own actions
                     if (action.senderName === currentUser.name) isMyAction = true;
                } else if (userRole === 'administrator') {
                    // Super Admin sees everything or just their own? Usually everything or role based.
                    // Let's restrict to role for clarity, or 'Administrator'
                    if (action.senderRole === 'Super Admin' || action.senderRole === 'administrator') isMyAction = true;
                } else if (userRole === 'admin') {
                    if (action.senderRole === 'Admin') isMyAction = true;
                } else if (userRole === 'technical_reviewer') {
                    if (action.senderRole === 'Technical Reviewer') isMyAction = true;
                } else if (userRole === 'application_reviewer') {
                    if (action.senderRole === 'Application Reviewer') isMyAction = true;
                }

                if (isMyAction) {
                    allActions.push({ ...action, clientName: audit.clientName, auditId: audit.id });
                }
            });
        });

        return allActions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [audits, userRole, currentUser]);

    const filteredActions = useMemo(() => {
        return myActions.filter(action => 
            action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            action.clientName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [myActions, searchTerm]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setActionFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setActionFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreateAction = async () => {
        if (!selectedClientId || !actionForm.title || !actionForm.description) {
            alert('Client, Title, and Description are required.');
            return;
        }

        const uploadedDocs: AuditorDocument[] = [];
        if (actionFiles.length > 0) {
            const filePromises = actionFiles.map(file => {
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
                return;
            }
        }

        let roleLabel = '';
        switch(userRole) {
            case 'administrator': roleLabel = 'Super Admin'; break;
            case 'admin': roleLabel = 'Admin'; break;
            case 'technical_reviewer': roleLabel = 'Technical Reviewer'; break;
            case 'application_reviewer': roleLabel = 'Application Reviewer'; break;
            default: roleLabel = 'Auditor';
        }

        const newAction: ActionItem = {
            id: crypto.randomUUID(),
            title: actionForm.title!,
            description: actionForm.description!,
            priority: actionForm.priority as 'High' | 'Medium' | 'Low' || 'Medium',
            dueDate: actionForm.dueDate,
            status: 'Open',
            senderName: currentUser.name,
            senderRole: roleLabel,
            attachments: uploadedDocs,
            createdAt: new Date().toISOString(),
        };

        const audit = audits.find(a => a.id === selectedClientId);
        if (audit) {
            const updatedAudit = {
                ...audit,
                actionItems: [...(audit.actionItems || []), newAction]
            };
            onUpdateAudit(updatedAudit);
            setIsCreateModalOpen(false);
            setSelectedClientId('');
            setActionForm({ priority: 'Medium' });
            setActionFiles([]);
            alert(`Action sent to ${audit.clientName}`);
        }
    };

    const handleCloseAction = (auditId: string, actionId: string) => {
        const audit = audits.find(a => a.id === auditId);
        if (audit) {
            const updatedActions = (audit.actionItems || []).map(a => 
                a.id === actionId ? { ...a, status: 'Closed' } as ActionItem : a
            );
            onUpdateAudit({ ...audit, actionItems: updatedActions });
            alert('Action marked as Closed.');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
            <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-2xl font-bold text-text-primary">Admin Request Item Management</h3>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-brand-accent transition-colors flex items-center gap-2"
                >
                    <PlusIcon /> Create New Admin Request
                </button>
            </div>

            <div className="p-4 bg-gray-50 border-b">
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <SearchIcon />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Filter by client or title..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6">
                {filteredActions.length > 0 ? (
                    <div className="space-y-4">
                        {filteredActions.map(action => {
                            const isExpanded = expandedActionId === action.id;
                            const isPendingReview = action.status === 'In Review';
                            
                            return (
                                <div key={action.id} className={`border rounded-lg bg-white transition-all ${isExpanded ? 'shadow-md ring-1 ring-brand-primary' : 'hover:shadow-sm'} ${isPendingReview ? 'border-l-4 border-l-red-500' : ''}`}>
                                    <div 
                                        onClick={() => setExpandedActionId(isExpanded ? null : action.id)}
                                        className="p-4 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                                    >
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-lg text-text-primary">{action.title}</h4>
                                                {isPendingReview && <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">Response Received</span>}
                                            </div>
                                            <p className="text-sm text-text-secondary">
                                                Client: <span className="font-semibold text-brand-primary">{action.clientName}</span> • Sent: {formatDate(action.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${action.priority === 'High' ? 'bg-red-100 text-red-700' : action.priority === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                                {action.priority}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${action.status === 'Open' ? 'bg-blue-100 text-blue-800' : action.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                {action.status}
                                            </span>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="p-4 border-t bg-gray-50">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Left: Action Details */}
                                                <div>
                                                    <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Action Details</h5>
                                                    <p className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border mb-3">{action.description}</p>
                                                    {action.attachments && action.attachments.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 mb-1">Attachments sent:</p>
                                                            <ul className="space-y-1">
                                                                {action.attachments.map((f, i) => (
                                                                    <li key={i} className="flex items-center gap-2 text-sm text-blue-600">
                                                                        <FileTextIcon /> <a href={f.dataUrl} download={f.name} className="hover:underline">{f.name}</a>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right: Response */}
                                                <div>
                                                    <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Client Response</h5>
                                                    {action.clientResponse || (action.clientResponseDocuments && action.clientResponseDocuments.length > 0) ? (
                                                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                                            {action.clientResponse && <p className="text-sm text-blue-900 whitespace-pre-wrap mb-2">{action.clientResponse}</p>}
                                                            {action.clientResponseDocuments && action.clientResponseDocuments.length > 0 && (
                                                                <ul className="space-y-1 border-t border-blue-200 pt-2">
                                                                    {action.clientResponseDocuments.map((f, i) => (
                                                                        <li key={i} className="flex items-center gap-2 text-sm text-blue-700">
                                                                            <FileTextIcon /> <a href={f.dataUrl} download={f.name} className="hover:underline">{f.name}</a>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                            {action.responseDate && <p className="text-xs text-blue-500 mt-2 text-right">Responded: {formatDate(action.responseDate)}</p>}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500 italic">No response yet.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4 flex justify-end pt-3 border-t border-gray-200">
                                                {action.status !== 'Closed' ? (
                                                    <button 
                                                        onClick={() => handleCloseAction(action.auditId, action.id)}
                                                        className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <CheckCircleIcon /> Close Action
                                                    </button>
                                                ) : (
                                                    <span className="flex items-center gap-2 text-green-600 font-bold">
                                                        <CheckCircleIcon /> Action Closed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-block p-4 rounded-full bg-gray-100 mb-4"><FilterIcon /></div>
                        <h4 className="text-lg font-semibold text-text-secondary">No Actions Found</h4>
                        <p className="text-gray-500">Create a new action to get started.</p>
                    </div>
                )}
            </div>

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                        <h3 className="text-xl font-bold text-text-primary mb-4">Create New Action Item</h3>
                        <div className="overflow-y-auto flex-grow pr-2">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Select Client</label>
                                    <select 
                                        value={selectedClientId} 
                                        onChange={(e) => setSelectedClientId(e.target.value)} 
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-accent"
                                    >
                                        <option value="">-- Select Client --</option>
                                        {audits.map(a => <option key={a.id} value={a.id}>{a.clientName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                                    <input 
                                        type="text" 
                                        value={actionForm.title || ''} 
                                        onChange={e => setActionForm({...actionForm, title: e.target.value})} 
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-accent"
                                        placeholder="e.g., Submit Missing Policy"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                                    <textarea 
                                        rows={3}
                                        value={actionForm.description || ''} 
                                        onChange={e => setActionForm({...actionForm, description: e.target.value})} 
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-accent"
                                        placeholder="Detailed instructions for the client..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Priority</label>
                                        <select 
                                            value={actionForm.priority} 
                                            onChange={e => setActionForm({...actionForm, priority: e.target.value as any})}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-accent"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Due Date</label>
                                        <input 
                                            type="date" 
                                            value={actionForm.dueDate || ''} 
                                            onChange={e => setActionForm({...actionForm, dueDate: e.target.value})}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-accent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Attachments</label>
                                    <label className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <span className="text-sm text-gray-500">Click to upload files</span>
                                        <input type="file" multiple onChange={handleFileChange} className="hidden" />
                                    </label>
                                    {actionFiles.length > 0 && (
                                        <ul className="mt-2 space-y-1">
                                            {actionFiles.map((f, i) => (
                                                <li key={i} className="flex justify-between items-center text-sm bg-gray-100 p-1.5 rounded">
                                                    <span className="truncate max-w-[200px]">{f.name}</span>
                                                    <button onClick={() => handleRemoveFile(i)} className="text-red-500 hover:text-red-700"><TrashIcon/></button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <button onClick={() => setIsCreateModalOpen(false)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded hover:bg-gray-300">Cancel</button>
                            <button onClick={handleCreateAction} className="bg-brand-primary text-white font-bold py-2 px-4 rounded hover:bg-brand-accent">Send Action</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
