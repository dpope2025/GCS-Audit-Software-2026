
import React, { useState, useRef, useEffect } from 'react';
import { FormTemplate, FormElement, FormElementType } from '../types';

// Icons
const TextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>;
const ParagraphIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8 10 4 4 4-4"/></svg>;
const CheckSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const CircleDotIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
const PenToolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>;
const MousePointerClickIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 9 5 12 1.774-5.226L21 14 9 9z"/><path d="m16.071 16.071 4.243 4.243"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const Edit2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;

interface FormBuilderProps {
  onSave: (form: FormTemplate) => void;
  onCancel: () => void;
  existingForm?: FormTemplate;
  initialPreview?: boolean;
}

const TOOLS: { type: FormElementType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Short Text', icon: <TextIcon /> },
  { type: 'textarea', label: 'Long Text', icon: <ParagraphIcon /> },
  { type: 'email', label: 'Email', icon: <MailIcon /> },
  { type: 'phone', label: 'Phone', icon: <PhoneIcon /> },
  { type: 'url', label: 'Website URL', icon: <LinkIcon /> },
  { type: 'date', label: 'Date', icon: <CalendarIcon /> },
  { type: 'dropdown', label: 'Drop-down', icon: <ChevronDownIcon /> },
  { type: 'radio', label: 'Single Choice', icon: <CircleDotIcon /> },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckSquareIcon /> },
  { type: 'image', label: 'Image', icon: <ImageIcon /> },
  { type: 'signature', label: 'Signature', icon: <PenToolIcon /> },
  { type: 'button', label: 'Button', icon: <MousePointerClickIcon /> },
];

export const FormBuilder: React.FC<FormBuilderProps> = ({ onSave, onCancel, existingForm, initialPreview = false }) => {
  const [title, setTitle] = useState(existingForm?.title || 'Untitled Form');
  const [description, setDescription] = useState(existingForm?.description || '');
  const [backgroundDataUrl, setBackgroundDataUrl] = useState<string | null>(existingForm?.backgroundDataUrl || null);
  const [backgroundType, setBackgroundType] = useState<'pdf' | 'image' | null>(existingForm?.backgroundType || null);
  const [elements, setElements] = useState<FormElement[]>(existingForm?.elements || []);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(initialPreview);

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setBackgroundDataUrl(event.target?.result as string);
      setBackgroundType(file.type === 'application/pdf' ? 'pdf' : 'image');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type') as FormElementType;
    if (!type || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newElement: FormElement = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type}`,
      x,
      y,
      width: 200,
      height: type === 'textarea' ? 80 : 40,
      required: false,
      options: ['Option 1', 'Option 2'], // Default options for selectors
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragStart = (e: React.DragEvent, type: FormElementType) => {
    e.dataTransfer.setData('type', type);
  };

  // Element dragging logic within canvas
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    const el = elements.find((el) => el.id === id);
    if (el) {
      setSelectedElementId(id);
      setIsDraggingElement(true);
      setDragOffset({
        x: e.clientX - (canvasRef.current?.getBoundingClientRect().left || 0) - el.x,
        y: e.clientY - (canvasRef.current?.getBoundingClientRect().top || 0) - el.y,
      });
    }
  };

  const handleElementMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingElement || !selectedElementId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setElements((prev) =>
      prev.map((el) => (el.id === selectedElementId ? { ...el, x, y } : el))
    );
  };

  const handleElementMouseUp = () => {
    setIsDraggingElement(false);
  };
  
  const handleSave = () => {
      if (!title.trim()) {
          alert("Please enter a form title");
          return;
      }
      const form: FormTemplate = {
          id: existingForm?.id || crypto.randomUUID(),
          title,
          description,
          backgroundDataUrl,
          backgroundType,
          elements,
          createdAt: existingForm?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
      };
      onSave(form);
  };

  const deleteElement = (id: string) => {
      setElements(prev => prev.filter(el => el.id !== id));
      if (selectedElementId === id) setSelectedElementId(null);
  };

  const updateElement = (id: string, updates: Partial<FormElement>) => {
      setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const selectedElement = elements.find(el => el.id === selectedElementId);

  return (
    <div className="fixed inset-0 bg-gray-100 z-[100] flex flex-col h-screen" onMouseMove={handleElementMouseMove} onMouseUp={handleElementMouseUp}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4 flex justify-between items-center shrink-0 z-20">
        <div className="flex items-center gap-4">
            <div>
                <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="text-xl font-bold border-none focus:ring-0 p-0 text-text-primary bg-transparent placeholder-gray-400" 
                    placeholder="Untitled Form"
                    readOnly={initialPreview}
                />
                <input 
                    type="text" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="text-sm text-text-secondary border-none focus:ring-0 p-0 w-full bg-transparent placeholder-gray-300" 
                    placeholder="Add a description"
                    readOnly={initialPreview}
                />
            </div>
        </div>
        <div className="flex items-center gap-3">
            {!initialPreview && (
                <div className="bg-gray-200 p-1 rounded-lg flex text-sm font-medium mr-4">
                    <button 
                        onClick={() => setIsPreviewMode(false)} 
                        className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${!isPreviewMode ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        <Edit2Icon /> Edit
                    </button>
                    <button 
                        onClick={() => setIsPreviewMode(true)} 
                        className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${isPreviewMode ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        <EyeIcon /> Preview
                    </button>
                </div>
            )}
            <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md font-medium">{initialPreview ? 'Close' : 'Cancel'}</button>
            {!initialPreview && <button onClick={handleSave} className="px-6 py-2 bg-brand-primary text-white rounded-md font-bold hover:bg-brand-accent shadow-sm">Save Form</button>}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbox (Left Sidebar) */}
        {!isPreviewMode && (
            <div className="w-64 bg-white border-r p-4 flex flex-col gap-4 shrink-0 overflow-y-auto z-10">
            <h3 className="font-semibold text-text-secondary text-xs uppercase tracking-wider">Elements</h3>
            <div className="grid grid-cols-2 gap-3">
                {TOOLS.map((tool) => (
                <div
                    key={tool.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, tool.type)}
                    className="flex flex-col items-center justify-center gap-2 p-3 border rounded-lg cursor-grab hover:bg-blue-50 hover:border-brand-accent transition-colors"
                >
                    <div className="text-brand-primary">{tool.icon}</div>
                    <span className="text-xs font-medium text-gray-700 text-center">{tool.label}</span>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-100 overflow-auto p-8 flex justify-center relative">
            <div 
                ref={canvasRef}
                className="bg-white shadow-lg relative transition-all duration-300"
                style={{ width: '210mm', minHeight: '297mm', height: 'auto' }} // A4 Dimensions approx
                onDrop={!isPreviewMode ? handleDrop : undefined}
                onDragOver={handleDragOver}
                onClick={() => setSelectedElementId(null)}
            >
                {/* Background Layer */}
                <div className="absolute inset-0 z-0">
                    {backgroundDataUrl ? (
                        backgroundType === 'pdf' ? (
                            <iframe 
                                src={backgroundDataUrl} 
                                width="100%" 
                                height="100%" 
                                className="w-full h-full border-none pointer-events-none" 
                                title="Background PDF" 
                            />
                        ) : (
                            <img src={backgroundDataUrl} alt="Form Background" className="w-full h-full object-contain pointer-events-none" />
                        )
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 m-4 rounded-lg">
                            <UploadIcon className="w-16 h-16 mb-4"/>
                            <p className="text-lg font-medium">Drag & Drop elements here</p>
                            {!isPreviewMode && (
                                <label className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-md cursor-pointer hover:bg-blue-100 pointer-events-auto">
                                    Upload PDF/Image Background
                                    <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} className="hidden" />
                                </label>
                            )}
                        </div>
                    )}
                </div>

                {/* Elements Layer */}
                {elements.map((el) => {
                    const isSelected = selectedElementId === el.id;
                    return (
                        <div
                            key={el.id}
                            style={{
                                position: 'absolute',
                                left: el.x,
                                top: el.y,
                                width: el.width,
                                height: el.height,
                            }}
                            className={`z-10 group ${!isPreviewMode && isSelected ? 'ring-2 ring-brand-primary ring-offset-2' : ''} ${!isPreviewMode ? 'cursor-move hover:bg-blue-50/30' : ''}`}
                            onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                        >
                             {!isPreviewMode && isSelected && (
                                <div className="absolute -top-8 right-0 bg-white shadow-md rounded-md flex overflow-hidden border z-50">
                                    <button onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }} className="p-1.5 text-red-500 hover:bg-red-50"><TrashIcon /></button>
                                </div>
                            )}
                            
                            {/* Render Actual Input for Preview/Edit */}
                            <div className="w-full h-full p-1 relative">
                                {el.type === 'button' ? (
                                    <button className="w-full h-full bg-brand-primary text-white font-bold rounded-md flex items-center justify-center text-sm shadow-sm hover:bg-brand-accent">
                                        {el.label}
                                    </button>
                                ) : el.type === 'checkbox' ? (
                                     <div className="flex items-center gap-2 h-full">
                                        <input type="checkbox" className="h-4 w-4 text-brand-primary rounded border-gray-300 focus:ring-brand-accent" disabled={!isPreviewMode} />
                                        <span className={`text-sm ${!isPreviewMode ? 'bg-white/80 px-1 rounded' : ''}`}>{el.label}</span>
                                    </div>
                                ) : el.type === 'radio' ? (
                                    <div className="h-full">
                                        <p className={`text-xs font-medium mb-1 ${!isPreviewMode ? 'bg-white/80 inline-block px-1 rounded' : ''}`}>{el.label}{el.required && '*'}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {el.options?.map((opt, i) => (
                                                <label key={i} className="flex items-center gap-1 text-xs bg-white/50 px-1">
                                                    <input type="radio" name={el.id} className="h-3 w-3 text-brand-primary" disabled={!isPreviewMode} />
                                                    {opt}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ) : el.type === 'signature' ? (
                                    <div className="w-full h-full border border-gray-300 bg-white/50 rounded flex flex-col justify-end p-1">
                                        <div className="border-b border-gray-400 mb-1 w-2/3 mx-auto"></div>
                                        <p className="text-[10px] text-center text-gray-500">{el.label}</p>
                                    </div>
                                ) : el.type === 'image' ? (
                                    <div className="w-full h-full bg-gray-100 border border-dashed border-gray-400 flex items-center justify-center rounded">
                                        <ImageIcon className="text-gray-400"/>
                                        <span className="text-xs text-gray-500 ml-1">Image</span>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col">
                                        {/* Label floating or inside depending on preference, keeping simple for PDF overlay */}
                                        <div className={`w-full h-full ${!isPreviewMode ? 'bg-yellow-100/30 border border-dashed border-yellow-500' : ''}`}>
                                            {el.type === 'textarea' ? (
                                                 <textarea 
                                                    placeholder={el.label + (el.required ? '*' : '')} 
                                                    className="w-full h-full resize-none bg-transparent border border-gray-300 rounded p-1 text-sm focus:ring-1 focus:ring-brand-accent"
                                                    disabled={!isPreviewMode}
                                                />
                                            ) : (
                                                 <input 
                                                    type={el.type === 'date' ? 'date' : 'text'} 
                                                    placeholder={el.label + (el.required ? '*' : '')} 
                                                    className="w-full h-full bg-transparent border-b border-gray-300 p-1 text-sm focus:outline-none focus:border-brand-accent"
                                                    disabled={!isPreviewMode}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                                {!isPreviewMode && <div className="absolute right-0 bottom-0 cursor-nwse-resize w-4 h-4 bg-transparent z-20" onMouseDown={(e) => { /* Resize logic would go here */ }} ></div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Properties Panel (Right Sidebar) */}
        {!isPreviewMode && selectedElement && (
            <div className="w-72 bg-white border-l p-4 flex flex-col gap-4 shrink-0 overflow-y-auto z-10 shadow-xl">
                <h3 className="font-semibold text-text-primary border-b pb-2">Edit {selectedElement.type}</h3>
                
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Label / Placeholder</label>
                    <input 
                        type="text" 
                        value={selectedElement.label} 
                        onChange={(e) => updateElement(selectedElement.id, { label: e.target.value })}
                        className="w-full text-sm border-gray-300 rounded-md focus:ring-brand-accent focus:border-brand-accent"
                    />
                </div>

                <div className="flex gap-4">
                     <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
                        <input 
                            type="number" 
                            value={selectedElement.width} 
                            onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })}
                            className="w-full text-sm border-gray-300 rounded-md focus:ring-brand-accent focus:border-brand-accent"
                        />
                    </div>
                     <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
                        <input 
                            type="number" 
                            value={selectedElement.height} 
                            onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })}
                            className="w-full text-sm border-gray-300 rounded-md focus:ring-brand-accent focus:border-brand-accent"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="required-check"
                        checked={selectedElement.required || false} 
                        onChange={(e) => updateElement(selectedElement.id, { required: e.target.checked })}
                        className="h-4 w-4 text-brand-primary rounded border-gray-300 focus:ring-brand-accent"
                    />
                    <label htmlFor="required-check" className="text-sm text-gray-700">Required Field</label>
                </div>

                {['dropdown', 'radio', 'checkbox'].includes(selectedElement.type) && (
                    <div className="border-t pt-3">
                         <label className="block text-xs font-medium text-gray-700 mb-2">Options (comma separated)</label>
                         <textarea 
                            rows={4}
                            value={selectedElement.options?.join(', ')} 
                            onChange={(e) => updateElement(selectedElement.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                            className="w-full text-sm border-gray-300 rounded-md focus:ring-brand-accent focus:border-brand-accent"
                        />
                    </div>
                )}
                
                <div className="mt-auto pt-4 border-t flex justify-center">
                    <button 
                        onClick={() => deleteElement(selectedElement.id)}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                    >
                        <TrashIcon /> Remove Element
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
