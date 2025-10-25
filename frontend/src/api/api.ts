import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach tenant header if set in localStorage
API.interceptors.request.use((cfg) => {
  const tenantId = localStorage.getItem('tenantId');
  if (tenantId) cfg.headers['x-tenant-id'] = tenantId;
  return cfg;
});

export default API;
