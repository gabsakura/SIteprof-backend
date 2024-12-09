const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const validatePassword = (password) => {
    return password.length >= 6;
  };
  
  const validateUserData = (userData) => {
    const errors = [];
  
    if (!userData.nome || userData.nome.trim().length < 3) {
      errors.push('Nome deve ter pelo menos 3 caracteres');
    }
  
    if (!validateEmail(userData.email)) {
      errors.push('Email inválido');
    }
  
    if (!userData.password && !userData.id) { // Verifica senha apenas para novos usuários
      if (!validatePassword(userData.password)) {
        errors.push('Senha deve ter pelo menos 6 caracteres');
      }
    }
  
    if (!['admin', 'user'].includes(userData.tipo)) {
      errors.push('Tipo de usuário inválido');
    }
  
    return errors;
  };
  
  module.exports = { validateUserData, validateEmail, validatePassword }; 