import React, { useState, useRef } from 'react';
import { Send, CheckCircle, AlertCircle, X, FileText, Lock, ServerCrash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

const PublicForm: React.FC = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});

  const handleInitialSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitStatus(null);
    
    const formData = new FormData(e.currentTarget);
    
    // Strict email validation
    const email = formData.get('email') as string;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter a valid email address (e.g., user@example.com).'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const data: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      if (value instanceof File) {
        if (value.name) {
          data[key] = value.name;
        }
      } else {
        data[key] = value.toString();
      }
    });

    setPreviewData(data);
    setShowPreview(true);
  };

  const handleFinalSubmit = async () => {
    if (!formRef.current) return;

    setIsSubmitting(true);
    const formData = new FormData(formRef.current);

    try {
      const response = await fetch(`${API_BASE_URL}/forms`, {
        method: 'POST',
        body: formData,
      });

      // Robust response parsing
      const contentType = response.headers.get("content-type");
      let data;
      let errorMessage = 'Failed to submit form';

      if (contentType && contentType.includes("application/json")) {
         data = await response.json();
         errorMessage = data.message || errorMessage;
      } else {
         const text = await response.text();
         errorMessage = text || response.statusText;
      }

      if (!response.ok) {
        throw new Error(errorMessage);
      }

      setSubmitStatus({
        type: 'success',
        message: 'Your application has been submitted successfully! We will contact you shortly.',
      });
      setShowPreview(false);
      formRef.current.reset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      
      let displayMessage = err.message || 'Something went wrong. Please try again.';
      
      if (err.message === 'Failed to fetch') {
        displayMessage = 'Could not connect to the server. Please ensure the backend is running.';
      }

      setSubmitStatus({
        type: 'error',
        message: displayMessage,
      });
      setShowPreview(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-blue-700 px-6 py-8 text-white text-center relative">
          {/* Admin Button */}
          <button 
            onClick={() => navigate('/admin/login')}
            className="absolute top-4 right-4 bg-blue-800/50 hover:bg-blue-800 text-white p-2 rounded-lg text-xs font-medium transition flex items-center gap-2 border border-blue-500/30"
            title="Admin Login"
          >
            <Lock size={14} />
            <span className="hidden sm:inline">Admin Panel</span>
          </button>

          <h1 className="text-3xl font-bold mb-2">Hajela's IAS Academy</h1>
          <p className="text-blue-100 text-lg">Admission & Student Details Form (UPSC / MPPSC)</p>
          <div className="mt-4 text-sm text-blue-200 flex justify-center gap-4">
             <span>admissions@hajelaias.com</span>
             <span>•</span>
             <span>+91-XXXXXXXXXX</span>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleInitialSubmit} className="p-6 sm:p-8 space-y-8">
          
          {submitStatus && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              submitStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {submitStatus.type === 'success' ? <CheckCircle size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
              <p>{submitStatus.message}</p>
            </div>
          )}

          {/* Section 1: Basic Details */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">1. Basic Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Student Name <span className="text-red-500">*</span></label>
                <input required name="studentName" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Full name" />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
                <select required name="gender" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Father's Name <span className="text-red-500">*</span></label>
                <input required name="fatherName" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Mother's Name <span className="text-red-500">*</span></label>
                <input required name="motherName" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
                <input required name="dob" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                <input name="aadhaarNumber" type="text" placeholder="12-digit number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <input required name="email" type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="example@mail.com" />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Phone <span className="text-red-500">*</span></label>
                <input required name="phone" type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="10-digit mobile" />
              </div>
            </div>

            <div className="mt-6 space-y-1">
               <label className="block text-sm font-medium text-gray-700">Address <span className="text-red-500">*</span></label>
               <textarea required name="address" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Full postal address"></textarea>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">City <span className="text-red-500">*</span></label>
                  <input required name="city" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
               </div>
               <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">State <span className="text-red-500">*</span></label>
                  <input required name="state" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
               </div>
               <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Pin Code <span className="text-red-500">*</span></label>
                  <input required name="pinCode" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
               </div>
            </div>
          </section>

          {/* Section 2: Exam Details */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">2. Exam Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Exam Type <span className="text-red-500">*</span></label>
                <select required name="examType" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Type</option>
                  <option value="UPSC">UPSC</option>
                  <option value="MPPSC">MPPSC</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Name & Year of Exam</label>
                <input name="examName" type="text" placeholder="e.g. CSE 2025" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Agency Name</label>
                <input name="agencyName" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Exam Year</label>
                <input name="examYear" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </section>

          {/* Section 3: Document Uploads */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">3. Document Uploads</h2>
            <p className="text-sm text-gray-500 mb-4">Accepted formats: JPG, PNG, PDF. Max size: 5MB per file.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="block text-sm font-medium text-gray-700">Passport Size Photo <span className="text-red-500">*</span></label>
                 <div className="relative border border-gray-300 border-dashed rounded-lg p-4 hover:bg-gray-50 transition">
                    <input required type="file" name="passport_photo" accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                 </div>
               </div>
               
               <div className="space-y-2">
                 <label className="block text-sm font-medium text-gray-700">10th Marksheet</label>
                 <div className="relative border border-gray-300 border-dashed rounded-lg p-4 hover:bg-gray-50 transition">
                    <input type="file" name="marksheet_10th" accept=".pdf,image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-medium text-gray-700">12th Marksheet</label>
                 <div className="relative border border-gray-300 border-dashed rounded-lg p-4 hover:bg-gray-50 transition">
                    <input type="file" name="marksheet_12th" accept=".pdf,image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-medium text-gray-700">Graduation Marksheet</label>
                 <div className="relative border border-gray-300 border-dashed rounded-lg p-4 hover:bg-gray-50 transition">
                    <input type="file" name="marksheet_graduation" accept=".pdf,image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                 </div>
               </div>
            </div>
          </section>

          {/* Declaration */}
          <section className="bg-gray-50 p-4 rounded-md border border-gray-200">
             <div className="flex items-start gap-3">
               <input required id="declaration" name="declaration" type="checkbox" className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
               <label htmlFor="declaration" className="text-sm text-gray-700">
                 I hereby declare that the information provided above and in the uploaded documents is true and correct to the best of my knowledge. I understand that any false information may lead to cancellation of my admission.
               </label>
             </div>
          </section>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-700 text-white px-8 py-3 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all shadow-md font-semibold"
            >
              Review Application <Send size={18} />
            </button>
          </div>
        </form>
      </div>
      
      {/* Confirmation Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-blue-50">
              <h3 className="text-xl font-bold text-gray-800">Review Your Application</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 flex gap-2">
                <AlertCircle size={20} className="shrink-0" />
                <p>Please review your details carefully. You cannot edit the form after final submission.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Student Name</p>
                  <p className="font-medium text-gray-900">{previewData.studentName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Email</p>
                  <p className="font-medium text-gray-900">{previewData.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Phone</p>
                  <p className="font-medium text-gray-900">{previewData.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Gender</p>
                  <p className="font-medium text-gray-900">{previewData.gender}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Date of Birth</p>
                  <p className="font-medium text-gray-900">{previewData.dob}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold">Exam Type</p>
                  <p className="font-medium text-gray-900">{previewData.examType}</p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold mb-2">Selected Documents</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(previewData).map(([key, value]) => {
                     // Heuristic to identify file fields based on names used in form inputs or file presence logic
                     const isFileField = ['passport_photo', 'marksheet_10th', 'marksheet_12th', 'marksheet_graduation'].includes(key);
                     if (isFileField && value) {
                       return (
                         <span key={key} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                           <FileText size={14} />
                           {value}
                         </span>
                       );
                     }
                     return null;
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                Edit Details
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800 disabled:opacity-70 transition-colors shadow-sm"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                {!isSubmitting && <CheckCircle size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-8 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Hajela's IAS Academy. All rights reserved.</p>
      </div>
    </div>
  );
};

export default PublicForm;