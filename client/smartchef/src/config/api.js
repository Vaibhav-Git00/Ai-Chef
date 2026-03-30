// API Configuration
// Use environment variable if available, otherwise default to localhost

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export default API_BASE;
