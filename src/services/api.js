import axios from 'axios';

const api = axios.create({
  baseURL: 'https://siteprof-backend.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor para erros
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // O servidor respondeu com um status de erro
      console.error('Server Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('No response received');
    } else {
      // Algo aconteceu na configuração da requisição
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 