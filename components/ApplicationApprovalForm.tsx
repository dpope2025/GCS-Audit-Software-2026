import React, { useState, useRef, useEffect } from 'react';
import { ApplicationReview, ApplicableStandards, Auditor, SignatureMetadata } from '../types';
import { IAF_CODES, INTEGRATED_MANAGEMENT_SYSTEM_STANDARDS } from '../constants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ApplicationApprovalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (review: ApplicationReview) => void;
  auditors: Auditor[];
}

const GCS_LOGO_BASE64 = 'data:image/png;base64,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GzBAAAAEDPgtwAAD/m9ggAEAAAGAAQAAAQIEDAAAEDAAAEDAAAEDAAAEDAAAEDAAMAAAQEDAAAEDAAAEDAAAEDAAMCA/Y4DBAAABAQEDAAAABAQEDAAAEDAAAEDAAMCA/w4AAAAQEDAAAEDAAAEDAAAEDAAMAOAPAAAAgIAAAACAgAAAAICAAAAAgIAAAACAgAAAAICA/90GAAAAICAAAAAgIAAAACAgAAAAICAAAAAgIAAAACAgAAAAIAAAACAgAAAICAAAAAgIAAAACAgAAAAIAAAACAgAAAgIAA/1QAAAAgIAAACAgAAAAICAAAAAgIAAAACAgAAAAICAAAAAgIAAAACAgAAAAICAAAAAgIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAACAgAAAAICAAAAAgIAAAACAgAAAAICAAAAAgIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAAIAAAACAgAAAA-cE+c'

export const ApplicationApprovalForm: React.FC<ApplicationApprovalFormProps> = ({ isOpen, onClose, onSave, auditors }) => {
  const [formData, setFormData] = useState<Omit<ApplicationReview, 'id' | 'createdAt' | 'pdfDataUri'>>({
    documentNo: 'GCS_MSCB_PR_03_F02',
    issueRevisionNo: '01/00',
    releaseDate: '10 June 2025',
    companyName: '',
    date: new Date().toISOString().split('T')[0],
    auditCycle: null,
    applicableStandards: { iso17021: false, iso17020: false, iso17024: false, iso17029: false, generalSystem: false },
    infoSufficient: null,
    misunderstandingResolved: null,
    canPerformActivity: null,
    scopeConsidered: null,
    integratedSystem: null,
    outsourcedPersonnelConsidered: null,
    integrationLevel: null,
    totalPersonnel: '',
    minManDays: '',
    iafCodesJustification: [],
    integratedStandards: [],
    decision: null,
    auditAssignedTo: [],
  });

  const iafCodesRef = useRef<HTMLSelectElement>(null);
  const integratedStandardsRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (iafCodesRef.current) {
      // FIX: Cast `opt` to HTMLOptionElement to resolve TypeScript error on `selected` and `value` properties.
      Array.from(iafCodesRef.current.options).forEach(opt => {
        (opt as HTMLOptionElement).selected = formData.iafCodesJustification.includes((opt as HTMLOptionElement).value);
      });
    }
  }, [formData.iafCodesJustification]);
  
  useEffect(() => {
    if (integratedStandardsRef.current) {
      // FIX: Cast `opt` to HTMLOptionElement to resolve TypeScript error on `selected` and `value` properties.
      Array.from(integratedStandardsRef.current.options).forEach(opt => {
        (opt as HTMLOptionElement).selected = formData.integratedStandards.includes((opt as HTMLOptionElement).value);
      });
    }
  }, [formData.integratedStandards]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      const [key, subkey] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [key]: { ...(prev[key as keyof typeof prev] as object), [subkey]: checked }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRadioChange = (name: keyof ApplicationReview, value: any) => {
      setFormData(prev => ({...prev, [name]: value}));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, field: 'iafCodesJustification' | 'integratedStandards') => {
      // FIX: Cast `opt` to HTMLOptionElement to resolve TypeScript error on `value` property.
      const selectedOptions = Array.from(e.target.selectedOptions).map(opt => (opt as HTMLOptionElement).value);
      setFormData(prev => ({...prev, [field]: selectedOptions}));
  }

  const handleGeneratePdf = async () => {
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
        
    const signingAuditor = auditors[0]; // Assuming the first auditor is the current user

    const signatureMetadata: SignatureMetadata = {
        ipAddress,
        timestamp: new Date().toISOString(),
        signerName: signingAuditor?.name || 'Unknown Reviewer',
    };

    const finalData: ApplicationReview = {
      ...formData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      pdfDataUri: null,
      signatureMetadata,
    };

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin;
    
    // Header
    try {
        doc.addImage(GCS_LOGO_BASE64, 'PNG', margin, y, 50, 17);
    } catch(e) {
        console.error("Error adding logo to PDF:", e);
    }
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ISO Application Approval', pageW / 2, y + 10, { align: 'center' });
    y += 25;

    // --- Header Table ---
    autoTable(doc, {
      startY: y,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      body: [
        ['Document No.', finalData.documentNo],
        ['Issue/Revision No:', finalData.issueRevisionNo],
        ['Release Date:', finalData.releaseDate],
      ],
      didDrawPage: data => y = data.cursor?.y || 0
    });
    
    y = (doc as any).lastAutoTable.finalY + 2;

    const standards = Object.entries(finalData.applicableStandards)
      .filter(([, checked]) => checked)
      .map(([key]) => {
          if (key === 'iso17021') return 'ISO 17021';
          if (key === 'iso17020') return 'ISO 17020';
          if (key === 'iso17024') return 'ISO 17024';
          if (key === 'iso17029') return 'ISO 17029';
          if (key === 'generalSystem') return 'General System';
          return '';
      }).join(', ');

    autoTable(doc, {
        startY: y,
        theme: 'grid',
        body: [['Applicable Standards', standards || 'N/A']],
        didDrawPage: data => y = data.cursor?.y || 0
    });
    
    y = (doc as any).lastAutoTable.finalY + 5;

    // --- Main Form Table ---
     autoTable(doc, {
      startY: y,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 80 } },
      body: [
        ['Company Name', finalData.companyName],
        ['Date', new Date(finalData.date).toLocaleDateString('en-GB')],
        ['Audit Cycle', finalData.auditCycle || 'N/A'],
      ],
      didDrawPage: data => y = data.cursor?.y || 0
    });
    
    y = (doc as any).lastAutoTable.finalY + 5;

    // --- Yes/No Questions ---
    const questionBody = [
        ['The Information about the applicant organization and its management system is sufficient to develop an audit programme:', finalData.infoSufficient === null ? 'N/A' : finalData.infoSufficient ? 'YES' : 'NO'],
        ['Any known misunderstanding between GCS and the applicant organization is resolved:', finalData.misunderstandingResolved === null ? 'N/A' : finalData.misunderstandingResolved ? 'YES' : 'NO'],
        ['Global Compliance Service can perform the certification activity:', finalData.canPerformActivity === null ? 'N/A' : finalData.canPerformActivity ? 'YES' : 'NO'],
        ['The scope of certification, the site, the time required, threats to impartiality and other relevant elements have been taken into consideration:', finalData.scopeConsidered === null ? 'N/A' : finalData.scopeConsidered ? 'YES' : 'NO'],
        ['Integrated Management System?', finalData.integratedSystem === null ? 'N/A' : finalData.integratedSystem ? 'YES' : 'NO'],
        ['Are peak number of outsourced personnel/ transient or temporary workers considered, quantified and added to declared permanent staff for appropriate man day consideration if applicable?', finalData.outsourcedPersonnelConsidered === null ? 'N/A' : finalData.outsourcedPersonnelConsidered ? 'YES' : 'NO']
    ];
    autoTable(doc, {
        startY: y,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2, valign: 'middle' },
        columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 30, halign: 'center' } },
        body: questionBody,
        didDrawPage: data => y = data.cursor?.y || 0
    });
    
    y = (doc as any).lastAutoTable.finalY + 5;
    
    // --- Detailed Fields ---
    autoTable(doc, {
      startY: y,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 80 } },
      body: [
        ['Integrated Management System Standards', finalData.integratedStandards.join(', ') || 'N/A'],
        ['Level of Integration based on Application in%', finalData.integrationLevel?.toString() || 'N/A'],
        ['Total number of declared permanent staff + any additional/quantified outsourced personnel#', finalData.totalPersonnel],
        ['Minimum audit man-days to be determined via issued quotation using – IAF MD5/11as justification', finalData.minManDays],
        ['IAF Codes Justification using GCS_MSCB_PR_03_WI_01 and IAF ID1', finalData.iafCodesJustification.join(', ') || 'N/A'],
      ],
      didDrawPage: data => y = data.cursor?.y || 0
    });

    y = (doc as any).lastAutoTable.finalY + 10;
    
    // --- Decision ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const decisionText = finalData.decision === 'Application Approved' ? 'Application Approved - YES' : 'Application Declined - NO';
    doc.text(decisionText, margin, y);
    y += 10;
    
    // --- Assigned To ---
     autoTable(doc, {
      startY: y,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 80 } },
      body: [
        ['Audit Assigned to:', finalData.auditAssignedTo.join(', ') || 'N/A'],
      ],
      didDrawPage: data => y = data.cursor?.y || 0
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // --- Signature ---
    if (signingAuditor?.signature) {
        if (y + 40 > 280) { // Check for page break
            doc.addPage();
            y = margin;
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Digitally Signed By: ${signatureMetadata.signerName}`, margin, y);
        y += 2;
        
        try {
            const signatureDataUrl = signingAuditor.signature;
            const mimeTypeMatch = signatureDataUrl.match(/data:(image\/(.+));base64,/);
            if (mimeTypeMatch) {
                const imageType = mimeTypeMatch[2].toUpperCase();
                doc.addImage(signatureDataUrl, imageType, margin, y, 60, 20);
            } else {
                 doc.addImage(signatureDataUrl, 'PNG', margin, y, 60, 20);
            }
        } catch(e) {
            console.error("Error adding signature image to PDF:", e);
            doc.text('[Signature Image Error]', margin, y + 10);
        }
        y += 22;

        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Date: ${new Date(signatureMetadata.timestamp).toLocaleString()}`, margin, y);
        doc.text(`IP Address: ${signatureMetadata.ipAddress}`, margin, y + 4);
    }


    const pdfDataUri = doc.output('datauristring');
    finalData.pdfDataUri = pdfDataUri;
    onSave(finalData);

    const pdfName = `${finalData.companyName}-${new Date(finalData.date).getFullYear()}-Application_Approval.pdf`;
    doc.save(pdfName);
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <h3 className="text-2xl font-bold text-text-primary mb-4 border-b pb-4 flex-shrink-0">ISO Application Approval</h3>
        <div className="overflow-y-auto pr-4 -mr-4 flex-grow">
          <div className="space-y-6">

            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="label-text">Document No.</label><input type="text" name="documentNo" value={formData.documentNo} onChange={handleChange} className="input-field" readOnly /></div>
              <div><label className="label-text">Issue/Revision No.</label><input type="text" name="issueRevisionNo" value={formData.issueRevisionNo} onChange={handleChange} className="input-field" readOnly /></div>
              <div><label className="label-text">Release Date</label><input type="text" name="releaseDate" value={formData.releaseDate} onChange={handleChange} className="input-field" readOnly /></div>
            </div>

            {/* Applicable Standards */}
            <div className="fieldset-container">
              <label className="label-text font-semibold">Applicable Standards</label>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                <label className="checkbox-label"><input type="checkbox" name="applicableStandards.iso17021" checked={formData.applicableStandards.iso17021} onChange={handleChange} className="form-checkbox"/> ISO 17021</label>
                <label className="checkbox-label"><input type="checkbox" name="applicableStandards.iso17020" checked={formData.applicableStandards.iso17020} onChange={handleChange} className="form-checkbox"/> ISO 17020</label>
                <label className="checkbox-label"><input type="checkbox" name="applicableStandards.iso17024" checked={formData.applicableStandards.iso17024} onChange={handleChange} className="form-checkbox"/> ISO 17024</label>
                <label className="checkbox-label"><input type="checkbox" name="applicableStandards.iso17029" checked={formData.applicableStandards.iso17029} onChange={handleChange} className="form-checkbox"/> ISO 17029</label>
                <label className="checkbox-label"><input type="checkbox" name="applicableStandards.generalSystem" checked={formData.applicableStandards.generalSystem} onChange={handleChange} className="form-checkbox"/> General System</label>
              </div>
            </div>
            
            {/* Main Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="label-text">Company Name</label><input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="input-field" /></div>
              <div><label className="label-text">Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" /></div>
              <div className="fieldset-container">
                  <label className="label-text">Audit Cycle</label>
                  <div className="flex gap-4 mt-2">
                    <label className="radio-label"><input type="radio" name="auditCycle" value="Initial Audit" checked={formData.auditCycle === 'Initial Audit'} onChange={() => handleRadioChange('auditCycle', 'Initial Audit')} className="form-radio"/> Initial Audit</label>
                    <label className="radio-label"><input type="radio" name="auditCycle" value="Re-certification" checked={formData.auditCycle === 'Re-certification'} onChange={() => handleRadioChange('auditCycle', 'Re-certification')} className="form-radio"/> Re-certification</label>
                  </div>
              </div>
            </div>
            
            {/* Questions Table */}
            <div className="space-y-4 border rounded-lg p-4">
                 <QuestionRow label="The Information about the applicant organization and its management system is sufficient to develop an audit programme:" name="infoSufficient" value={formData.infoSufficient} onChange={handleRadioChange}/>
                 <QuestionRow label="Any known misunderstanding between GCS and the applicant organization is resolved:" name="misunderstandingResolved" value={formData.misunderstandingResolved} onChange={handleRadioChange} />
                 <QuestionRow label="Global Compliance Service can perform the certification activity:" name="canPerformActivity" value={formData.canPerformActivity} onChange={handleRadioChange}/>
                 <QuestionRow label="The scope of certification, the site, the time required, threats to impartiality and other relevant elements have been taken into consideration:" name="scopeConsidered" value={formData.scopeConsidered} onChange={handleRadioChange}/>
                 <QuestionRow label="Integrated Management System?" name="integratedSystem" value={formData.integratedSystem} onChange={handleRadioChange}/>
                 <QuestionRow label="Are peak number of outsourced personnel/ transient or temporary workers considered, quantified and added to declared permanent staff for appropriate man day consideration if applicable?" name="outsourcedPersonnelConsidered" value={formData.outsourcedPersonnelConsidered} onChange={handleRadioChange}/>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="label-text">Integrated Management System Standards</label>
                        <select multiple ref={integratedStandardsRef} onChange={(e) => handleMultiSelectChange(e, 'integratedStandards')} className="w-full input-field" style={{height: '120px'}}>
                            {INTEGRATED_MANAGEMENT_SYSTEM_STANDARDS.map(s => <option key={s.code} value={s.code}>{s.description}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label-text">Total number of declared permanent staff + any additional/quantified outsourced personnel#</label>
                        <input type="text" name="totalPersonnel" value={formData.totalPersonnel} onChange={handleChange} className="input-field" />
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="label-text">Level of Integration based on Application in%</label>
                        <input type="number" name="integrationLevel" value={formData.integrationLevel || ''} onChange={handleChange} className="input-field" min="0" max="100"/>
                    </div>
                    <div>
                        <label className="label-text">Minimum audit man-days to be determined via issued quotation using - IAF MD5/11as justification</label>
                        <input type="text" name="minManDays" value={formData.minManDays} onChange={handleChange} className="input-field" />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="label-text">IAF Codes Justification using GCS_MSCB_PR_03_WI_01 and IAF ID1</label>
                    <select multiple ref={iafCodesRef} onChange={(e) => handleMultiSelectChange(e, 'iafCodesJustification')} className="w-full input-field" style={{height: '150px'}}>
                        {IAF_CODES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.description}</option>)}
                    </select>
                </div>
                 <div className="md:col-span-2">
                    <label className="label-text">Audit Assigned to</label>
                    <select multiple name="auditAssignedTo" onChange={(e) => handleMultiSelectChange(e, 'auditAssignedTo' as any)} className="w-full input-field" style={{height: '100px'}}>
                        {auditors.map(auditor => <option key={auditor.email} value={auditor.name}>{auditor.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Decision */}
            <div className="fieldset-container">
              <label className="label-text font-semibold">Decision</label>
              <div className="flex gap-4 mt-2">
                <label className="checkbox-label text-lg"><input type="radio" name="decision" value="Application Approved" checked={formData.decision === 'Application Approved'} onChange={() => handleRadioChange('decision', 'Application Approved')} className="form-radio"/> Application Approved</label>
                <label className="checkbox-label text-lg"><input type="radio" name="decision" value="Application Declined" checked={formData.decision === 'Application Declined'} onChange={() => handleRadioChange('decision', 'Application Declined')} className="form-radio"/> Application Declined</label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6 pt-4 border-t flex-shrink-0">
          <button onClick={onClose} className="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
          <button onClick={handleGeneratePdf} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-accent">Save & Generate PDF</button>
        </div>

        <style>{`
          .input-field {
              display: block;
              width: 100%;
              padding: 0.5rem 0.75rem;
              border: 1px solid #DFE1E6;
              border-radius: 0.375rem;
              background-color: #FAFBFC;
              transition: box-shadow .15s ease-in-out;
          }
          .input-field:focus {
              outline: none;
              box-shadow: 0 0 0 2px #4C9AFF;
              background-color: white;
          }
          .label-text {
              display: block;
              font-size: 0.875rem;
              font-weight: 500;
              color: #5E6C84;
              margin-bottom: 0.25rem;
          }
          .checkbox-label, .radio-label {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              font-size: 1rem;
              color: #172B4D;
          }
          .form-checkbox, .form-radio {
              height: 1.25rem;
              width: 1.25rem;
              color: #0052CC;
              border-color: #DFE1E6;
          }
           .form-checkbox:focus, .form-radio:focus {
              --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
              --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
              box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
              --tw-ring-color: #4C9AFF;
          }
          .fieldset-container {
              padding: 1rem;
              border: 1px solid #DFE1E6;
              border-radius: 0.5rem;
              background-color: #F4F5F7;
          }
          .question-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.75rem 0;
              border-bottom: 1px solid #DFE1E6;
          }
          .question-row:last-child {
              border-bottom: none;
          }
        `}</style>
      </div>
    </div>
  );
};


const QuestionRow: React.FC<{
    label: string;
    name: keyof ApplicationReview;
    value: boolean | null;
    onChange: (name: keyof ApplicationReview, value: boolean) => void;
}> = ({ label, name, value, onChange }) => {
    return (
        <div className="question-row">
            <p className="text-base text-text-primary pr-4">{label}</p>
            <div className="flex gap-4 flex-shrink-0">
                <label className="radio-label"><input type="radio" name={name} checked={value === true} onChange={() => onChange(name, true)} className="form-radio" /> YES</label>
                <label className="radio-label"><input type="radio" name={name} checked={value === false} onChange={() => onChange(name, false)} className="form-radio" /> NO</label>
            </div>
        </div>
    )
}
