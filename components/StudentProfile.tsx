import React, { useState } from 'react';
import { X, Printer, Download, Mail, Phone, MapPin, FileText, Check, XCircle, AlertCircle } from 'lucide-react';
import { AdmissionForm } from '../types';
import { FILE_BASE_URL, API_BASE_URL, STATUS_COLORS } from '../constants';

interface StudentProfileProps {
  form: AdmissionForm;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string) => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ form, onClose, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [downloadConfirm, setDownloadConfirm] = useState<{ url: string; label: string } | null>(null);

  const handleStatusChange = async (newStatus: 'Approved' | 'Rejected') => {
    if (!window.confirm(`Are you sure you want to mark this application as ${newStatus}?`)) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/forms/${form._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        onStatusUpdate(form._id, newStatus);
        onClose();
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating status");
    } finally {
      setUpdating(false);
    }
  };

  const docs = form.documents || {};
  const docEntries = Object.entries(docs).filter(([, v]) => v);

  const buildUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${FILE_BASE_URL}${path}`;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-blue-800 text-white px-6 py-4 flex items-center justify-between shadow-md no-print">
            <div>
              <h2 className="font-bold text-lg">Application Details</h2>
              <div className="text-xs text-blue-200 mt-0.5">ID: {form.office?.studentId || form._id.slice(-6)} • {new Date(form.submissionDate).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm transition" onClick={() => window.print()}>
                <Printer size={16} /> Print
              </button>
              <button className="p-2 hover:bg-white/20 rounded-full transition" onClick={onClose}>
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8" id="printable-area">
            
            {/* Status Bar (No Print) */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 no-print">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Current Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${STATUS_COLORS[form.status]}`}>
                  {form.status}
                </span>
              </div>
              <div className="flex gap-3">
                 {form.status !== 'Approved' && (
                   <button 
                     onClick={() => handleStatusChange('Approved')}
                     disabled={updating}
                     className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                   >
                     <Check size={16} /> Approve
                   </button>
                 )}
                 {form.status !== 'Rejected' && (
                   <button 
                     onClick={() => handleStatusChange('Rejected')}
                     disabled={updating}
                     className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                   >
                     <XCircle size={16} /> Reject
                   </button>
                 )}
              </div>
            </div>

            {/* Document Header */}
            <div className="text-center border-b pb-6">
              <h1 className="text-2xl font-bold text-gray-900">Hajela's IAS Academy</h1>
              <p className="text-gray-500 text-sm mt-1">Admission & Student Details Form (UPSC / MPPSC)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
              {/* Sidebar: Photo & Contact */}
              <div className="space-y-6">
                 <div className="w-48 h-56 mx-auto md:mx-0 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                   {form.documents?.passport_photo ? (
                     <img 
                       src={buildUrl(form.documents.passport_photo)} 
                       alt="Student" 
                       className="w-full h-full object-cover"
                     />
                   ) : (
                     <span className="text-gray-400 text-xs uppercase font-semibold">No Photo</span>
                   )}
                 </div>

                 <div>
                   <h3 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-200 pb-1 mb-3">Contact Info</h3>
                   <div className="space-y-3 text-sm text-gray-600">
                     <div className="flex items-center gap-2">
                       <Mail size={16} className="text-blue-600 shrink-0" />
                       <span className="break-all">{form.basicDetails.email}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <Phone size={16} className="text-blue-600 shrink-0" />
                       <span>{form.basicDetails.phone}</span>
                     </div>
                     <div className="flex items-start gap-2">
                       <MapPin size={16} className="text-blue-600 shrink-0 mt-0.5" />
                       <span>
                         {form.basicDetails.address}, <br/>
                         {form.basicDetails.city}, {form.basicDetails.state} - {form.basicDetails.pinCode}
                       </span>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Main Content */}
              <div className="space-y-8">
                 
                 {/* Basic Details */}
                 <section>
                   <h3 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-200 pb-1 mb-4">1. Basic Details</h3>
                   <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                     <Detail label="Full Name" value={form.basicDetails.studentName} />
                     <Detail label="Gender" value={form.basicDetails.gender} />
                     <Detail label="Father's Name" value={form.basicDetails.fatherName} />
                     <Detail label="Mother's Name" value={form.basicDetails.motherName} />
                     <Detail label="Date of Birth" value={form.basicDetails.dob} />
                     <Detail label="Aadhaar No." value={form.basicDetails.aadhaarNumber} />
                   </div>
                 </section>

                 {/* Exam Details */}
                 <section>
                   <h3 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-200 pb-1 mb-4">2. Exam Details</h3>
                   <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                     <Detail label="Exam Name" value={form.examDetails.examName} />
                     <Detail label="Exam Type" value={form.examDetails.examType} />
                     <Detail label="Agency" value={form.examDetails.agencyName} />
                     <Detail label="Target Year" value={form.examDetails.examYear} />
                   </div>
                 </section>

                 {/* Documents */}
                 <section className="no-print">
                   <h3 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-200 pb-1 mb-4">3. Attached Documents</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {docEntries.map(([key, path]) => (
                       <button 
                         key={key} 
                         onClick={() => setDownloadConfirm({ url: buildUrl(path), label: key.replace(/_/g, ' ') })}
                         className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition group w-full text-left"
                       >
                         <div className="bg-blue-100 p-2 rounded text-blue-600">
                           <FileText size={18} />
                         </div>
                         <div className="flex-1 overflow-hidden">
                           <p className="text-sm font-medium text-gray-700 truncate capitalize">
                             {key.replace(/_/g, ' ')}
                           </p>
                           <p className="text-xs text-gray-400">Click to view/download</p>
                         </div>
                         <Download size={16} className="text-gray-300 group-hover:text-blue-500" />
                       </button>
                     ))}
                     {docEntries.length === 0 && <p className="text-sm text-gray-500 italic">No documents uploaded.</p>}
                   </div>
                 </section>

                 {/* Office Use */}
                 <section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                   <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">For Office Use Only</h3>
                   <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <Detail label="Registration No" value={form.office?.registrationNo || "—"} />
                      <Detail label="Student ID" value={form.office?.studentId || "—"} />
                   </div>
                 </section>

              </div>
            </div>
          </div>
        </div>

        {/* Download Confirmation Modal */}
        {downloadConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setDownloadConfirm(null)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 text-amber-600 mb-4">
                <AlertCircle size={24} />
                <h3 className="font-bold text-lg text-gray-900">Confirm Download</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Are you sure you want to view or download the document <strong>{downloadConfirm.label}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setDownloadConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    window.open(downloadConfirm.url, '_blank');
                    setDownloadConfirm(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Download size={16} /> Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const Detail = ({ label, value }: { label: string, value?: string }) => (
  <div>
    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
    <p className="font-medium text-gray-900">{value || "—"}</p>
  </div>
);

export default StudentProfile;