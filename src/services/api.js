import axios from 'axios';

// Determina se está em produção baseado na URL atual
const isProduction = window.location.hostname === 'projeto-siteprofissional-anf3.onrender.com';

const api = axios.create({
  baseURL: isProduction 
    ? 'https://siteprof-backend.onrender.com'
    : 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Habilita o envio de credenciais
});

// Interceptor para adicionar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Log da requisição
  console.log('Request:', {
    url: config.url,
    method: config.method,
    baseURL: config.baseURL,
    headers: config.headers
  });
  return config;
});

// Interceptor para erros
api.interceptors.response.use(
  response => {
    console.log('Response:', response.data);
    return response;
  },
  error => {
    if (error.response) {
      console.error('Response Error:', {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Request Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 