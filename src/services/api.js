import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.MODE === 'development' 
    ? 'http://localhost:5000'  // desenvolvimento
    : 'https://siteprof-backend.onrender.com', // produção
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para tratar erros
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api; 