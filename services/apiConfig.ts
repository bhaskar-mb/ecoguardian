
const isLocalhost = window.location.hostname === 'localhost';

// In production, we assume the backend is at the same origin or configured via VITE_API_URL
export const API_BASE_URL = (import.meta as any).env.VITE_API_URL || (isLocalhost ? 'http://localhost:5000' : window.location.origin);

export const API_AUTH_URL = `${API_BASE_URL}/api/auth`;
export const API_REPORTS_URL = `${API_BASE_URL}/api/reports`;
export const API_USERS_URL = `${API_BASE_URL}/api/users`;
export const API_ALERTS_URL = `${API_BASE_URL}/api/alerts`;

export default API_BASE_URL;
