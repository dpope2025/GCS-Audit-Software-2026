
import React, { useState, useEffect } from 'react';
// FIX: Import `Clause` type to resolve 'Cannot find name' error.
import { Audit, Auditor, UserRole, Workflow, Clause, KnowledgeBaseVideo, KnowledgeBaseDocument } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import Header from './components/Header';
import AuditDetail from './components/AuditDetail';
import AdminPortal from './components/AdminDashboard';
import ClientDashboard from './components/ClientDashboard';
import AuditorDashboard from './components/AuditorDashboard';
import TechnicalReviewerDashboard from './components/TechnicalReviewerDashboard';
import { INITIAL_AUDITORS, INITIAL_WORKFLOWS, INITIAL_AUDITS } from './constants';
import ApplicationReviewerDashboard from './components/ApplicationReviewerDashboard';
import AdminWorkspace from './components/AdminWorkspace';


const App: React.FC = () => {
  const [audits, setAudits] = useLocalStorage<Audit[]>('iso-audits', INITIAL_AUDITS);
  const [auditors, setAuditors] = useLocalStorage<Auditor[]>('iso-auditors-list', INITIAL_AUDITORS);
  const [workflows, setWorkflows] = useLocalStorage<Workflow[]>('iso-workflows', INITIAL_WORKFLOWS);
  const [knowledgeBaseVideos, setKnowledgeBaseVideos] = useLocalStorage<KnowledgeBaseVideo[]>('kb-videos', []);
  const [knowledgeBaseDocuments, setKnowledgeBaseDocuments] = useLocalStorage<KnowledgeBaseDocument[]>('kb-docs', []);
  const [currentViewedAuditId, setCurrentViewedAuditId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('client');
  const [clientView, setClientView] = useState<{ view: 'dashboard' | 'audit_portal', section?: string }>({ view: 'dashboard', section: 'dashboard_home' });
  
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage<boolean>('user-logged-in', false);
  const [userProfilePic, setUserProfilePic] = useLocalStorage<string | null>('user-profile-pic', null);


  useEffect(() => {
    // Reset to the main dashboard whenever the user or client selection changes.
    setClientView({ view: 'dashboard', section: 'dashboard_home' });
  }, [userRole, currentViewedAuditId]);

  const handleCreateAudit = (audit: Audit) => {
    setAudits(prevAudits => [...prevAudits, audit]);
  };

  const handleUpdateAudit = (updatedAudit: Audit) => {
    setAudits(prevAudits =>
      prevAudits.map(audit => (audit.id === updatedAudit.id ? updatedAudit : audit))
    );
  };
  
  const handleDeleteAudit = (auditId: string) => {
    setAudits(prevAudits => prevAudits.filter(audit => audit.id !== auditId));
    setCurrentViewedAuditId(null);
  };

  const deselectAudit = () => {
    setCurrentViewedAuditId(null);
  };

  const getClausesForAudit = (audit: Audit | null): Clause[] => {
      if (!audit) return [];
      const workflow = workflows.find(w => w.id === audit.standardId);
      const stage = workflow?.stages.find(s => s.stage === audit.currentStage);
      const workflowClauses = stage?.clauses || [];
      return [...workflowClauses, ...(audit.customClauses || [])];
  }
  
  const navigateToClientSection = (sectionId: string) => {
    setClientView({ view: 'dashboard', section: sectionId });
  }

  const renderContent = () => {
    const selectedAudit = audits.find(audit => audit.id === currentViewedAuditId) || null;

    if (selectedAudit) {
      const auditWithClauses = {...selectedAudit, clauses: getClausesForAudit(selectedAudit)};
      
      if (userRole === 'client') {
        if (clientView.view === 'dashboard') {
          return (
            <ClientDashboard 
              audit={auditWithClauses} 
              onNavigateToAuditPortal={() => setClientView({ view: 'audit_portal' })}
              onUpdateAudit={handleUpdateAudit}
              knowledgeBaseVideos={knowledgeBaseVideos}
              knowledgeBaseDocuments={knowledgeBaseDocuments}
              initialSection={clientView.section}
              isLoggedIn={isLoggedIn}
              userProfilePic={userProfilePic}
              setUserProfilePic={setUserProfilePic}
            />
          );
        } else { // clientView is 'audit_portal'
          return (
            <AuditDetail 
              key={selectedAudit.id}
              audit={auditWithClauses} 
              auditors={auditors}
              workflows={workflows}
              onUpdate={handleUpdateAudit} 
              onBack={() => setClientView({ view: 'dashboard', section: 'dashboard_home' })}
              onNavigateToReports={() => navigateToClientSection('reports')}
              onDelete={handleDeleteAudit}
              userRole={userRole}
            />
          );
        }
      } else { // Auditor, Admin, or Technical Reviewer view
        return (
          <AuditDetail 
            key={selectedAudit.id}
            audit={auditWithClauses} 
            auditors={auditors}
            workflows={workflows}
            onUpdate={handleUpdateAudit} 
            onBack={deselectAudit} // Go back to the main list
            onDelete={handleDeleteAudit}
            userRole={userRole}
            onNavigateToReports={() => {}}
          />
        );
      }
    }

    if (userRole === 'administrator') {
      return (
        <AdminPortal 
          audits={audits}
          auditors={auditors}
          setAuditors={setAuditors}
          workflows={workflows}
          setWorkflows={setWorkflows}
          knowledgeBaseVideos={knowledgeBaseVideos}
          setKnowledgeBaseVideos={setKnowledgeBaseVideos}
          knowledgeBaseDocuments={knowledgeBaseDocuments}
          setKnowledgeBaseDocuments={setKnowledgeBaseDocuments}
          onSelectAudit={setCurrentViewedAuditId}
          onCreateAudit={handleCreateAudit}
          onUpdateAudit={handleUpdateAudit}
          onDeleteAudit={handleDeleteAudit}
          userRole={userRole}
        />
      );
    }
    
    if (userRole === 'auditor') {
        return (
            <AuditorDashboard
                audits={audits}
                auditors={auditors}
                setAuditors={setAuditors}
                onSelectAudit={setCurrentViewedAuditId}
                onUpdateAudit={handleUpdateAudit}
                workflows={workflows}
                getClausesForAudit={getClausesForAudit}
            />
        );
    }

    if (userRole === 'technical_reviewer') {
        return (
            <TechnicalReviewerDashboard
                audits={audits}
                auditors={auditors}
                setAuditors={setAuditors}
                workflows={workflows}
                onSelectAudit={setCurrentViewedAuditId}
                onCreateAudit={handleCreateAudit}
                onUpdateAudit={handleUpdateAudit}
                onDeleteAudit={handleDeleteAudit}
                userRole={userRole}
            />
        );
    }

    if (userRole === 'application_reviewer') {
        return (
            <ApplicationReviewerDashboard 
                audits={audits}
                auditors={auditors}
                setAuditors={setAuditors}
                onUpdateAudit={handleUpdateAudit}
            />
        );
    }

    if (userRole === 'admin') {
        return (
            <AdminWorkspace
                audits={audits}
                auditors={auditors}
                setAuditors={setAuditors}
                onUpdateAudit={handleUpdateAudit}
            />
        );
    }

    // Placeholder view for CLIENT when no audit is selected from dropdown
    return (
      <div className="text-center p-12 bg-white rounded-lg shadow-md mt-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="mt-4 text-2xl font-bold text-text-primary">Welcome to the Portal</h3>
        <p className="mt-2 text-lg text-text-secondary">Please select a client from the dropdown menu above to view their audit dashboard.</p>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-secondary text-text-primary">
      <Header 
        userRole={userRole} 
        setUserRole={setUserRole} 
        audits={audits}
        auditors={auditors}
        setAuditors={setAuditors}
        currentViewedAuditId={currentViewedAuditId}
        setCurrentViewedAuditId={setCurrentViewedAuditId}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        userProfilePic={userProfilePic}
        setUserProfilePic={setUserProfilePic}
        onUpdateAudit={handleUpdateAudit}
      />
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
