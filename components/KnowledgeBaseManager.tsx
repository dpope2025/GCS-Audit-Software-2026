
import React, { useState } from 'react';
import { KnowledgeBaseVideo, KnowledgeBaseDocument } from '../types';

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const VideoIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2" ry="2"/></svg>;
const FileIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;

interface KnowledgeBaseManagerProps {
    videos: KnowledgeBaseVideo[];
    setVideos: (videos: KnowledgeBaseVideo[] | ((val: KnowledgeBaseVideo[]) => KnowledgeBaseVideo[])) => void;
    documents: KnowledgeBaseDocument[];
    setDocuments: (documents: KnowledgeBaseDocument[] | ((val: KnowledgeBaseDocument[]) => KnowledgeBaseDocument[])) => void;
}

const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({ videos, setVideos, documents, setDocuments }) => {
    const [newVideoTitle, setNewVideoTitle] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [newDocTitle, setNewDocTitle] = useState('');
    const [stagedDoc, setStagedDoc] = useState<File | null>(null);
    const [videoToDelete, setVideoToDelete] = useState<KnowledgeBaseVideo | null>(null);
    const [documentToDelete, setDocumentToDelete] = useState<KnowledgeBaseDocument | null>(null);

    const getEmbedUrl = (url: string): string => {
        // YouTube
        let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        let match = url.match(regExp);
        if (match && match[2] && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}`;
        }

        // Vimeo
        regExp = /vimeo\.com\/(?:video\/)?(\d+)/;
        match = url.match(regExp);
        if (match && match[1]) {
            return `https://player.vimeo.com/video/${match[1]}`;
        }

        // Google Drive
        regExp = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
        match = url.match(regExp);
        if (match && match[1]) {
            return `https://drive.google.com/file/d/${match[1]}/preview`;
        }
        
        // Fallback to original url, for direct links like .mp4
        return url;
    }

    const handleAddVideo = () => {
        const title = newVideoTitle.trim();
        const url = newVideoUrl.trim();
        if (!title || !url) {
            alert('Please provide a title and a URL.');
            return;
        }

        const embedUrl = getEmbedUrl(url);

        const newVideo: KnowledgeBaseVideo = {
            id: crypto.randomUUID(),
            title,
            url,
            embedUrl
        };
        setVideos(prev => [...prev, newVideo]);
        setNewVideoTitle('');
        setNewVideoUrl('');
    }
    
    const handleDeleteVideo = (id: string) => {
        const video = videos.find(v => v.id === id);
        if (video) {
            setVideoToDelete(video);
        }
    }

    const confirmDeleteVideo = () => {
        if (!videoToDelete) return;
        setVideos(prev => prev.filter(v => v.id !== videoToDelete.id));
        setVideoToDelete(null);
    }
    
    const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setStagedDoc(file);
        }
    };

    const handleAddDocument = async () => {
        if (!stagedDoc || !newDocTitle.trim()) {
            alert('Please provide a title and select a file.');
            return;
        }

        const newDocumentPromise = new Promise<KnowledgeBaseDocument>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({
                    id: crypto.randomUUID(),
                    title: newDocTitle.trim(),
                    name: stagedDoc.name,
                    type: stagedDoc.type,
                    size: stagedDoc.size,
                    dataUrl: reader.result as string,
                    uploadDate: new Date().toISOString(),
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(stagedDoc);
        });
        
        try {
            const newDocument = await newDocumentPromise;
            setDocuments(prev => [...prev, newDocument]);
            setStagedDoc(null);
            setNewDocTitle('');
            alert(`Document "${newDocument.title}" added successfully.`);
        } catch (error) {
            console.error("Error processing file:", error);
            alert("There was an error saving the document.");
        }
    };
    
    const handleDeleteDocument = (id: string) => {
        const doc = documents.find(d => d.id === id);
        if (doc) {
            setDocumentToDelete(doc);
        }
    };

    const confirmDeleteDocument = () => {
        if (!documentToDelete) return;
        setDocuments(prev => prev.filter(d => d.id !== documentToDelete.id));
        setDocumentToDelete(null);
    }
    

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-text-primary mb-4 border-b pb-4">Manage Knowledge Base</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Video Management */}
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-text-primary">Training Videos</h4>
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <input type="text" value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)} placeholder="Video Title" className="w-full input-field mb-2" />
                        <input type="url" value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} placeholder="Video URL (e.g., YouTube, Vimeo, Google Drive)" className="w-full input-field mb-3" />
                        <button onClick={handleAddVideo} className="w-full bg-brand-primary text-white font-bold py-2 px-3 rounded-md hover:bg-brand-accent transition-colors">Add Video</button>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {videos.map(video => (
                            <div key={video.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                                <div className="flex items-center gap-2 min-w-0">
                                    <VideoIcon className="text-red-500 flex-shrink-0" />
                                    <span className="text-sm font-medium truncate">{video.title}</span>
                                </div>
                                <button onClick={() => handleDeleteVideo(video.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors flex-shrink-0" aria-label={`Delete ${video.title}`}>
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Document Management */}
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-text-primary">Helpful Documents</h4>
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <input
                            type="text"
                            value={newDocTitle}
                            onChange={e => setNewDocTitle(e.target.value)}
                            placeholder="Document Title"
                            className="w-full input-field mb-2"
                        />
                        <label className="w-full block text-center cursor-pointer bg-brand-secondary hover:bg-gray-200 text-text-primary font-semibold py-2 px-3 rounded-md text-sm transition-colors mb-3">
                            {stagedDoc ? stagedDoc.name : 'Choose File'}
                            <input type="file" onChange={handleDocFileChange} className="hidden" />
                        </label>
                        <button 
                            onClick={handleAddDocument} 
                            disabled={!stagedDoc || !newDocTitle.trim()} 
                            className="w-full bg-brand-primary text-white font-bold py-2 px-3 rounded-md hover:bg-brand-accent transition-colors disabled:bg-gray-400">
                                Add Document
                        </button>
                    </div>
                     <div className="space-y-2 max-h-80 overflow-y-auto">
                        {documents.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileIcon className="text-blue-500 flex-shrink-0" />
                                    <span className="text-sm font-medium truncate">{doc.title || doc.name}</span>
                                </div>
                                <button onClick={() => handleDeleteDocument(doc.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors flex-shrink-0" aria-label={`Delete ${doc.title || doc.name}`}>
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {videoToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-4 text-red-600">Confirm Deletion</h3>
                        <p className="text-text-secondary mb-6">
                            Are you sure you want to permanently delete the video: <br/>"<span className="font-semibold">{videoToDelete.title}</span>"?
                            <br /><br />
                            <span className="font-bold">This action cannot be undone.</span>
                        </p>
                        <div className="flex justify-end gap-4 mt-8">
                            <button onClick={() => setVideoToDelete(null)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteVideo}
                                className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {documentToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-4 text-red-600">Confirm Deletion</h3>
                        <p className="text-text-secondary mb-6">
                            Are you sure you want to permanently delete the document: <br/>"<span className="font-semibold">{documentToDelete.title || documentToDelete.name}</span>"?
                            <br /><br />
                            <span className="font-bold">This action cannot be undone.</span>
                        </p>
                        <div className="flex justify-end gap-4 mt-8">
                            <button onClick={() => setDocumentToDelete(null)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteDocument}
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

export default KnowledgeBaseManager;
