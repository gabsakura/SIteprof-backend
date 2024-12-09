import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        email,
        password
      });
      // ... resto do código
    } catch (error) {
      console.error('Erro no login:', error);
      setError(error.response?.data?.error || 'Erro ao tentar fazer login');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... rest of the form ... */}
    </form>
  );
};

export default LoginForm; 