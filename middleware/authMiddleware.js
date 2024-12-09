const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não está definido no arquivo .env');
  process.exit(1);
}

const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const verificarAdmin = (req, res, next) => {
  if (req.usuario.tipo !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
};

module.exports = { verificarToken, verificarAdmin };
