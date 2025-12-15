
import React, { useEffect, useState } from 'react';
import { Search, Eye, RefreshCw, Filter, FileText, Inbox, CheckCircle, XCircle, Paperclip } from 'lucide-react';
import { API_BASE_URL, STATUS_COLORS } from '../constants';
import { AdmissionForm } from '../types';
import StudentProfile from './StudentProfile';

const AdminDashboard: React.FC = () => {
  const [forms, setForms] = useState<AdmissionForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedForm, setSelectedForm] = useState<AdmissionForm | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchForms = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/forms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch forms');
      const data = await response.json();
      setForms(data);
    } catch (err) {
      setError('Could not load applications. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setForms(prev => prev.map(f => f._id === id ? { ...f, status: newStatus as any } : f));
    if (selectedForm && selectedForm._id === id) {
      setSelectedForm({ ...selectedForm, status: newStatus as any });
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.basicDetails?.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          form.basicDetails?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          form.basicDetails?.phone?.includes(searchQuery);

    const matchesStatus = statusFilter === 'All' || form.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const countDocs = (form: AdmissionForm) => {
    if (!form.documents) return 0;
    return Object.values(form.documents).filter(Boolean).length;
  };

  const stats = {
    total: forms.length,
    pending: forms.filter(f => f.status === 'Pending').length,
    approved: forms.filter(f => f.status === 'Approved').length,
    rejected: forms.filter(f => f.status === 'Rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">Total Applications</p>
            <Inbox size={16} className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-yellow-100 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start">
            <p className="text-yellow-600 text-xs font-bold uppercase tracking-wide">Pending Review</p>
            <FileText size={16} className="text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start">
            <p className="text-green-600 text-xs font-bold uppercase tracking-wide">Approved</p>
            <CheckCircle size={16} className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-700">{stats.approved}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start">
            <p className="text-red-600 text-xs font-bold uppercase tracking-wide">Rejected</p>
            <XCircle size={16} className="text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
             <Filter className="absolute left-3 top-2.5 text-gray-500" size={16} />
             <select 
               className="w-full md:w-auto pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="All">All Status</option>
               <option value="Pending">Pending</option>
               <option value="Approved">Approved</option>
               <option value="Rejected">Rejected</option>
             </select>
          </div>
          <button 
            onClick={fetchForms} 
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
           <div className="p-12 text-center text-gray-500 flex flex-col items-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
             Loading applications...
           </div>
        ) : error ? (
           <div className="p-12 text-center text-red-500 bg-red-50">{error}</div>
        ) : filteredForms.length === 0 ? (
           <div className="p-16 text-center text-gray-500 flex flex-col items-center">
             <Inbox size={48} className="text-gray-300 mb-4" />
             <p className="text-lg font-medium text-gray-900">No applications found</p>
             <p className="text-sm">Try adjusting your search or filters</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 font-semibold">Student Name</th>
                  <th className="p-4 font-semibold">Exam</th>
                  <th className="p-4 font-semibold">Contact</th>
                  <th className="p-4 font-semibold">Docs</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredForms.map((form) => (
                  <tr key={form._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{form.basicDetails?.studentName}</div>
                      <div className="text-gray-500 text-xs">{form.basicDetails?.city}, {form.basicDetails?.state}</div>
                    </td>
                    <td className="p-4 text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{form.examDetails?.examType}</span>
                        <span className="text-gray-400">•</span>
                        <span>{form.examDetails?.examYear}</span>
                      </div>
                      <span className="text-gray-400 text-xs block truncate max-w-[150px]">{form.examDetails?.examName}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-900 font-mono text-xs">{form.basicDetails?.phone}</div>
                      <div className="text-gray-500 text-xs truncate max-w-[180px]">{form.basicDetails?.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Paperclip size={14} />
                        <span className="text-xs font-medium">{countDocs(form)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">
                      {new Date(form.submissionDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[form.status] || STATUS_COLORS.Pending}`} >
                        {form.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedForm(form)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 rounded-md font-medium text-xs transition-all shadow-sm"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedForm && (
        <StudentProfile
          form={selectedForm}
          onClose={() => setSelectedForm(null)}
          onStatusUpdate={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
