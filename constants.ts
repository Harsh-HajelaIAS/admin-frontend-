// ==============================
// API BASE URL (Backend)
// ==============================
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://admin-backend-l7ie.onrender.com";


// ==============================
// FILE / UPLOAD BASE URL
// (Same backend serves uploads)
// ==============================
export const FILE_BASE_URL =
  import.meta.env.VITE_FILE_URL ||
  "https://admin-backend-l7ie.onrender.com";


// ==============================
// STATUS COLORS (UI ONLY)
// ==============================
export const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
};
