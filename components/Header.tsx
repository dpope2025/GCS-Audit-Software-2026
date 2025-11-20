import React, { useState, useRef, useEffect, useMemo } from 'react';
import { UserRole, Audit, Auditor } from '../types';

interface HeaderProps {
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;
    audits: Audit[];
    auditors: Auditor[];
    setAuditors: (auditors: Auditor[] | ((val: Auditor[]) => Auditor[])) => void;
    currentViewedAuditId: string | null;
    setCurrentViewedAuditId: (id: string | null) => void;
    isLoggedIn: boolean;
    setIsLoggedIn: (loggedIn: boolean) => void;
    userProfilePic: string | null;
    setUserProfilePic: (pic: string | null) => void;
    onUpdateAudit: (audit: Audit) => void;
}

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ProfilePlaceholderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

const FONT_OPTIONS = [
    { name: 'Cursive', value: 'cursive' },
    { name: 'Elegant', value: "'Segoe Script', 'Brush Script MT', cursive" },
    { name: 'Handwritten', value: "'Lucida Handwriting', 'Apple Chancery', cursive" },
    { name: 'Blocky', value: "'Impact', fantasy" },
];


const Header: React.FC<HeaderProps> = ({ userRole, setUserRole, audits, auditors, setAuditors, currentViewedAuditId, setCurrentViewedAuditId, isLoggedIn, setIsLoggedIn, userProfilePic, setUserProfilePic, onUpdateAudit }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  
  // Client profile state
  const [profileName, setProfileName] = useState('');
  const [profileTitle, setProfileTitle] = useState('');
  const [profileEmail, setProfileEmail] = useState('');

  // Auditor/Admin profile state
  const [profileAuditorName, setProfileAuditorName] = useState('');
  const [profileAuditorEmail, setProfileAuditorEmail] = useState('');
  const [newSignature, setNewSignature] = useState<{ type: 'initial' | 'draw' | 'upload' | 'clear', data?: string }>({ type: 'initial', data: undefined });
  
  const [signatureInputType, setSignatureInputType] = useState<'type' | 'upload'>('upload');
  const [typedSignature, setTypedSignature] = useState('');
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[2].value);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);


  const currentAudit = useMemo(() => audits.find(a => a.id === currentViewedAuditId), [audits, currentViewedAuditId]);
  const currentUser = useMemo(() => (userRole !== 'client' && auditors.length > 0 ? auditors[0] : null), [userRole, auditors]);

  useEffect(() => {
    if (isEditProfileModalOpen) {
        if (userRole === 'client' && currentAudit) {
            setProfileName(currentAudit.clientRepName || '');
            setProfileTitle(currentAudit.clientRepTitle || '');
            setProfileEmail(currentAudit.clientRepEmail || '');
        } else if (currentUser) {
            setProfileAuditorName(currentUser.name);
            setProfileAuditorEmail(currentUser.email);
            setTypedSignature(currentUser.name);
            setNewSignature({ type: 'initial', data: currentUser.signature });
            setSelectedFont(FONT_OPTIONS[2].value); // Default to Handwritten
        }
    }
  }, [isEditProfileModalOpen, userRole, currentAudit, currentUser]);

  useEffect(() => {
      setTypedSignature(profileAuditorName);
  }, [profileAuditorName]);

   useEffect(() => {
        if (signatureInputType !== 'type' || !isEditProfileModalOpen) return;

        const canvas = signatureCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        // Set a white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#000000';
        ctx.font = `48px ${selectedFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);

        const dataUrl = canvas.toDataURL('image/png');
        
        if (typedSignature.trim() === '') {
            setNewSignature({ type: 'clear', data: undefined });
        } else {
            setNewSignature({ type: 'draw', data: dataUrl }); // 'draw' type is reused for typed sigs
        }

    }, [typedSignature, selectedFont, signatureInputType, isEditProfileModalOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuRef]);

  const handleLoginLogout = () => {
    setIsLoggedIn(!isLoggedIn);
    setIsProfileMenuOpen(false);
    if (isLoggedIn) { // If logging out
      setUserProfilePic(null);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const openEditProfileModal = () => {
    setIsProfileMenuOpen(false);
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = () => {
    if (userRole === 'client' && currentAudit) {
        const updatedAudit: Audit = {
            ...currentAudit,
            clientRepName: profileName,
            clientRepTitle: profileTitle,
            clientRepEmail: profileEmail,
        };
        onUpdateAudit(updatedAudit);
    } else if (currentUser) {
        const updatedAuditors = auditors.map((auditor, index) => {
            if (index === 0) { // Assumption: editing first auditor as current user
                return {
                    ...auditor,
                    name: profileAuditorName,
                    email: profileAuditorEmail,
                    signature: newSignature.type === 'initial' ? currentUser.signature : newSignature.data,
                };
            }
            return auditor;
        });
        setAuditors(updatedAuditors);
    }
    setIsEditProfileModalOpen(false);
  };
  
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSignature({ type: 'upload', data: reader.result as string });
        setTypedSignature('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearSignature = () => {
    setNewSignature({ type: 'clear', data: undefined });
    setTypedSignature('');
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const auditId = e.target.value;
    setCurrentViewedAuditId(auditId === "none" ? null : auditId);
  }
  
  return (
    <>
      <header className="bg-brand-primary shadow-md h-24">
        <div className="container mx-auto px-4 md:px-8 h-full flex items-center relative">
          <div className="flex items-center gap-3">
              <img src="http://dashboard.gcsregistrar.com/wp-content/uploads/2025/11/colored-logo1.png" alt="AuditSync Logo" className="h-12" />
              <h1 className="text-xl font-bold text-white tracking-wide">GCS AuditSync Dashboard</h1>
          </div>
          
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-6">
              {(userRole === 'client' || userRole === 'auditor') && audits.length > 0 && (
                <div className="relative">
                  <select
                    value={currentViewedAuditId || 'none'}
                    onChange={handleClientChange}
                    className="bg-white text-brand-primary font-semibold py-2 pl-4 pr-10 rounded-lg shadow-sm border-2 border-transparent focus:border-brand-accent focus:outline-none focus:ring-0 appearance-none transition-colors"
                    aria-label="Select a client to view"
                  >
                    <option value="none" disabled>-- Select a Client --</option>
                    {audits.map(audit => (
                        <option key={audit.id} value={audit.id}>
                            {audit.clientName}
                        </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-primary">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-1 bg-brand-accent p-1 rounded-full">
                  <button 
                      onClick={() => setUserRole('client')}
                      className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${userRole === 'client' ? 'bg-white text-brand-primary' : 'text-white'}`}
                  >
                      Client
                  </button>
                  <button 
                      onClick={() => {
                          setUserRole('application_reviewer');
                          setCurrentViewedAuditId(null);
                      }}
                      className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${userRole === 'application_reviewer' ? 'bg-white text-brand-primary' : 'text-white'}`}
                  >
                      App Review
                  </button>
                  <button 
                      onClick={() => setUserRole('auditor')}
                      className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${userRole === 'auditor' ? 'bg-white text-brand-primary' : 'text-white'}`}
                  >
                      Auditor
                  </button>
                  <button 
                      onClick={() => {
                          setUserRole('technical_reviewer');
                          setCurrentViewedAuditId(null);
                      }}
                      className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${userRole === 'technical_reviewer' ? 'bg-white text-brand-primary' : 'text-white'}`}
                  >
                      Cert Decision
                  </button>
                  <button 
                      onClick={() => setUserRole('admin')}
                      className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${userRole === 'admin' ? 'bg-white text-brand-primary' : 'text-white'}`}
                  >
                      Admin
                  </button>
                  <button 
                      onClick={() => {
                          setUserRole('administrator');
                          setCurrentViewedAuditId(null);
                      }}
                      className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${userRole === 'administrator' ? 'bg-white text-brand-primary' : 'text-white'}`}
                  >
                      Super Admin
                  </button>
              </div>
          </div>

          <div className="ml-auto">
            <div className="relative" ref={profileMenuRef}>
              <button onClick={() => setIsProfileMenuOpen(prev => !prev)} className="h-12 w-12 rounded-full bg-brand-accent flex items-center justify-center overflow-hidden border-2 border-white/50 hover:border-white transition-colors">
                {isLoggedIn && userProfilePic ? (
                  <img src={userProfilePic} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon />
                )}
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {isLoggedIn ? (
                    <>
                      <button onClick={openEditProfileModal} className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-100">
                        Edit Profile
                      </button>
                      <button onClick={handleLoginLogout} className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-100">
                        Logout
                      </button>
                    </>
                  ) : (
                    <button onClick={handleLoginLogout} className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-100">
                      Login
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {isEditProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg">
            <h3 className="text-2xl font-bold text-text-primary mb-6">Edit Profile</h3>
            
            <div className="flex flex-col items-center mb-6">
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-brand-primary/20 shadow-sm">
                    {userProfilePic ? (
                        <img src={userProfilePic} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <ProfilePlaceholderIcon />
                    )}
                </div>
                <button onClick={triggerFileInput} className="mt-3 text-sm font-semibold text-brand-primary hover:underline">
                    Change Picture
                </button>
            </div>

            {userRole === 'client' && currentAudit ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                        <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Title/Position</label>
                        <input type="text" value={profileTitle} onChange={(e) => setProfileTitle(e.target.value)} className="w-full input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                        <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="w-full input-field" />
                    </div>
                </div>
            ) : userRole !== 'client' && currentUser ? (
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                        <input type="text" value={profileAuditorName} onChange={(e) => setProfileAuditorName(e.target.value)} className="w-full input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                        <input type="email" value={profileAuditorEmail} onChange={(e) => setProfileAuditorEmail(e.target.value)} className="w-full input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Signature</label>
                         <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                            {newSignature.data && (
                                <div className="flex flex-col items-center">
                                    <p className="text-xs text-text-secondary self-start mb-1">Signature Preview:</p>
                                    <div className="p-2 border rounded-md bg-white w-full flex justify-center">
                                        <img src={newSignature.data} alt="Signature Preview" className="max-h-24" />
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-4 border-b pb-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="sigType" value="upload" checked={signatureInputType === 'upload'} onChange={() => setSignatureInputType('upload')} className="form-radio" /> Upload
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="sigType" value="type" checked={signatureInputType === 'type'} onChange={() => setSignatureInputType('type')} className="form-radio" /> Type
                                </label>
                            </div>

                            {signatureInputType === 'type' ? (
                                <div className="space-y-2">
                                    <select value={selectedFont} onChange={e => setSelectedFont(e.target.value)} className="w-full input-field">
                                        {FONT_OPTIONS.map(font => <option key={font.value} value={font.value} style={{fontFamily: font.value}}>{font.name}</option>)}
                                    </select>
                                    <div className="p-2 border rounded-md bg-white w-full h-24 flex items-center justify-center overflow-hidden">
                                        <p className="text-3xl whitespace-nowrap" style={{ fontFamily: selectedFont }}>{typedSignature || 'Signature Preview'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="w-full block text-center cursor-pointer bg-brand-secondary hover:bg-gray-200 text-text-primary font-semibold py-3 px-3 rounded-md text-sm transition-colors">
                                        Upload an image
                                        <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                                    </label>
                                </div>
                            )}
                             <div className="flex justify-end pt-2 border-t">
                                <button type="button" onClick={handleClearSignature} className="text-sm font-semibold text-red-600 hover:underline">
                                    Clear Signature
                                </button>
                            </div>
                        </div>
                        <canvas ref={signatureCanvasRef} width={400} height={100} className="hidden"></canvas>
                    </div>
                </div>
            ) : (
                <p className="text-center text-text-secondary">Profile details can be edited when viewing a specific client dashboard or when logged in as an administrator.</p>
            )}

            <div className="flex justify-end gap-4 mt-8">
              <button onClick={() => setIsEditProfileModalOpen(false)} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
              <button onClick={handleSaveProfile} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-accent">Save Changes</button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfilePicChange}
              className="hidden"
              accept="image/*"
            />
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
    </>
  );
};

export default Header;