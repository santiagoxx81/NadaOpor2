export default function ehAdmin(req, res, next) {
  if (req?.usuario?.tipo_usuario === 'ADMIN') return next();
  return res.status(403).json({ erro: 'Acesso restrito ao administrador' });
}
