// middlewares/autenticarJWT.js
import jwt from 'jsonwebtoken';

export function autenticarJWT(req, res, next) {
  try {
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ erro: 'Token ausente' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = {
      id: payload.id,
      nome: payload.nome,
      email: payload.email,
      tipo_usuario: payload.tipo_usuario
    };
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido' });
  }
}
