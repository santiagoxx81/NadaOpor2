export function ok(res, data) {
  return res.json(data);
}
export function criado(res, data) {
  return res.status(201).json(data);
}
export function erro(res, status, msg) {
  return res.status(status).json({ erro: msg });
}
