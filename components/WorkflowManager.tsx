
import React, { useState, useEffect } from 'react';
// FIX: Move ISOStandardID import from 'types' to 'constants' where it is defined.
import { Workflow, Clause, AuditStage } from '../types';
import { ISO_STANDARDS, ISOStandardID } from '../constants';

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;


interface WorkflowManagerProps {
  workflows: Workflow[];
  setWorkflows: (workflows: Workflow[] | ((val: Workflow[]) => Workflow[])) => void;
}

const WorkflowManager: React.FC<WorkflowManagerProps> = ({ workflows, setWorkflows }) => {
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<ISOStandardID>(workflows[0]?.id || ISOStandardID.ISO9001);
    const [editableWorkflow, setEditableWorkflow] = useState<Workflow | null>(null);
    const [selectedStage, setSelectedStage] = useState<AuditStage | null>(null);

    const [isAdding, setIsAdding] = useState(false);
    const [newClauseTitle, setNewClauseTitle] = useState('');
    const [newClauseDescription, setNewClauseDescription] = useState('');
    
    const [editingClauseId, setEditingClauseId] = useState<string | null>(null);
    const [editedClauseData, setEditedClauseData] = useState({ title: '', description: '' });

    const [clauseToDelete, setClauseToDelete] = useState<{ stage: AuditStage, clauseId: string, clauseTitle: string } | null>(null);

    useEffect(() => {
        const workflow = workflows.find(w => w.id === selectedWorkflowId);
        if (workflow) {
            setEditableWorkflow(JSON.parse(JSON.stringify(workflow))); // Deep copy for editing
            setSelectedStage(workflow.stages[0]?.stage || null);
            setEditingClauseId(null);
        }
    }, [selectedWorkflowId, workflows]);

    const handleSelectWorkflow = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedWorkflowId(e.target.value as ISOStandardID);
    }

    const handleRemoveClause = (stage: AuditStage, clauseId: string) => {
        if (!editableWorkflow) return;
        const clause = editableWorkflow.stages
            .find(s => s.stage === stage)
            ?.clauses.find(c => c.id === clauseId);
        if (clause) {
            setClauseToDelete({ stage, clauseId, clauseTitle: clause.title });
        }
    }
    
    const confirmRemoveClause = () => {
        if (!editableWorkflow || !clauseToDelete) return;
        const { stage, clauseId } = clauseToDelete;

        const updatedStages = editableWorkflow.stages.map(s => {
            if (s.stage === stage) {
                return { ...s, clauses: s.clauses.filter(c => c.id !== clauseId) };
            }
            return s;
        });
        setEditableWorkflow({ ...editableWorkflow, stages: updatedStages });
        setClauseToDelete(null);
    };

    const handleAddClause = () => {
        if (!editableWorkflow || !selectedStage || !newClauseTitle.trim()) {
            alert("Please provide a title for the new question.");
            return;
        }

        const newClause: Clause = {
            id: `wf-custom-${crypto.randomUUID()}`,
            title: newClauseTitle,
            description: newClauseDescription,
            isCustom: false, // It's a workflow question, not a client-specific one
        };

        const updatedStages = editableWorkflow.stages.map(s => {
            if (s.stage === selectedStage) {
                return { ...s, clauses: [...s.clauses, newClause] };
            }
            return s;
        });

        setEditableWorkflow({ ...editableWorkflow, stages: updatedStages });
        setNewClauseTitle('');
        setNewClauseDescription('');
        setIsAdding(false);
    }
    
    const handleStartEdit = (clause: Clause) => {
        setEditingClauseId(clause.id);
        setEditedClauseData({ title: clause.title, description: clause.description });
    };

    const handleCancelEdit = () => {
        setEditingClauseId(null);
        setEditedClauseData({ title: '', description: '' });
    };

    const handleSaveEdit = () => {
        if (!editableWorkflow || !selectedStage || !editingClauseId) return;

        const updatedStages = editableWorkflow.stages.map(s => {
            if (s.stage === selectedStage) {
                return {
                    ...s,
                    clauses: s.clauses.map(c =>
                        c.id === editingClauseId ? { ...c, ...editedClauseData } : c
                    )
                };
            }
            return s;
        });

        setEditableWorkflow({ ...editableWorkflow, stages: updatedStages });
        handleCancelEdit();
    };


    const handleSaveWorkflow = () => {
        if (!editableWorkflow) return;
        setWorkflows(prev => prev.map(w => w.id === editableWorkflow.id ? editableWorkflow : w));
        alert('Workflow saved successfully!');
    }

    if (!editableWorkflow) {
        return <p>Loading workflows...</p>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <h3 className="text-xl font-semibold text-text-primary">Manage Audit Workflows</h3>
                    <p className="text-text-secondary mt-1">Customize the questions for each stage of an audit for different standards.</p>
                </div>
                <button onClick={handleSaveWorkflow} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-brand-accent transition-colors">
                    Save Workflow
                </button>
            </div>
            
            <div className="mb-6">
                <label htmlFor="workflow-select" className="block text-sm font-medium text-text-secondary mb-1">Select Standard to Edit:</label>
                <select id="workflow-select" value={selectedWorkflowId} onChange={handleSelectWorkflow} className="w-full max-w-md input-field">
                    {ISO_STANDARDS.map(std => <option key={std.id} value={std.id}>{std.name}</option>)}
                </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Stage Navigation */}
                <div className="md:col-span-1">
                    <h4 className="font-semibold text-text-primary mb-2">Audit Stages</h4>
                    <nav className="flex flex-col space-y-1">
                        {editableWorkflow.stages.map(s => (
                            <button
                                key={s.stage}
                                onClick={() => setSelectedStage(s.stage)}
                                className={`text-left p-2 rounded-md text-sm font-medium transition-colors ${selectedStage === s.stage ? 'bg-brand-primary text-white' : 'bg-gray-100 hover:bg-gray-200 text-text-secondary'}`}
                            >
                                {s.stage}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Clauses for selected stage */}
                <div className="md:col-span-3">
                    {selectedStage && (
                        <div>
                            <h4 className="text-lg font-semibold text-text-primary mb-4">Questions for: {selectedStage}</h4>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto border p-4 rounded-lg bg-gray-50">
                                {editableWorkflow.stages.find(s => s.stage === selectedStage)?.clauses.map(clause => {
                                    const isEditingThis = editingClauseId === clause.id;
                                    return (
                                        <div key={clause.id} className="bg-white p-3 rounded-md shadow-sm">
                                            {isEditingThis ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editedClauseData.title}
                                                        onChange={e => setEditedClauseData(d => ({ ...d, title: e.target.value }))}
                                                        className="w-full input-field font-medium"
                                                    />
                                                    <textarea
                                                        value={editedClauseData.description}
                                                        onChange={e => setEditedClauseData(d => ({ ...d, description: e.target.value }))}
                                                        className="w-full input-field text-sm"
                                                        rows={2}
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={handleCancelEdit} className="text-sm bg-gray-200 text-gray-800 font-medium py-1 px-3 rounded-lg hover:bg-gray-300">Cancel</button>
                                                        <button onClick={handleSaveEdit} className="text-sm bg-blue-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-blue-700">Save</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium text-text-primary">{clause.id.startsWith('wf-custom-') ? '' : `${clause.id} - `}{clause.title}</p>
                                                        <p className="text-sm text-text-secondary mt-1">{clause.description}</p>
                                                    </div>
                                                    <div className="flex items-center flex-shrink-0 ml-4">
                                                        <button onClick={() => handleStartEdit(clause)} className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition-colors" aria-label="Edit question">
                                                            <EditIcon />
                                                        </button>
                                                        <button onClick={() => handleRemoveClause(selectedStage, clause.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors" aria-label="Remove question">
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {editableWorkflow.stages.find(s => s.stage === selectedStage)?.clauses.length === 0 && (
                                    <p className="text-text-secondary italic text-center py-4">No questions defined for this stage.</p>
                                )}
                            </div>
                            <div className="mt-4">
                                {!isAdding ? (
                                    <button onClick={() => setIsAdding(true)} className="bg-brand-secondary text-text-primary font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-gray-200 transition-colors">
                                        + Add New Question
                                    </button>
                                ) : (
                                    <div className="p-4 border rounded-lg bg-white">
                                        <h5 className="font-semibold mb-2">New Question</h5>
                                        <input type="text" value={newClauseTitle} onChange={e => setNewClauseTitle(e.target.value)} placeholder="Question Title" className="w-full input-field mb-2" />
                                        <textarea value={newClauseDescription} onChange={e => setNewClauseDescription(e.target.value)} placeholder="Description (optional)" rows={3} className="w-full input-field mb-3" />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setIsAdding(false)} className="bg-gray-200 text-gray-800 font-medium py-2 px-3 rounded-lg hover:bg-gray-300">Cancel</button>
                                            <button onClick={handleAddClause} className="bg-brand-primary text-white font-bold py-2 px-3 rounded-lg hover:bg-brand-accent">Add Question</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
             {clauseToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-4 text-red-600">Confirm Deletion</h3>
                        <p className="text-text-secondary mb-6">
                            Are you sure you want to permanently delete the question: <br/>"<span className="font-semibold">{clauseToDelete.clauseTitle}</span>"?
                            <br /><br />
                            <span className="font-bold">This action cannot be undone.</span>
                        </p>
                        <div className="flex justify-end gap-4 mt-8">
                            <button onClick={() => setClauseToDelete(null)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={confirmRemoveClause}
                                className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Confirm Delete
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

export default WorkflowManager;
