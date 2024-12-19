import axios from 'axios';

const api = axios.create({
  baseURL: 'https://siteprof-backend.onrender.com',  // sua URL do backend
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api; 