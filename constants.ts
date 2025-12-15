// In a real production build, these would be environment variables.
// For this setup, we assume the backend runs on port 5000 locally.
export const API_BASE_URL = 'http://localhost:5000/api';
export const FILE_BASE_URL = 'http://localhost:5000';

export const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
};