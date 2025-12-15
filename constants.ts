const BASE_URL = import.meta.env.VITE_API_URL;

export const API_BASE_URL = `${BASE_URL}/api`;
export const FILE_BASE_URL = BASE_URL;

export const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
};
