import pool from '../db.js';
import jwt from 'jsonwebtoken';
import { hashSenha, compararSenha } from '../utils/senha.js';

export async function cadastrar(req, res) {
  try {
    const { nome, email, telefone, documento, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });

    const [existe] = await pool.query('SELECT id FROM usuarios WHERE email = ? LIMIT 1', [email]);
    if (existe.length) return res.status(409).json({ erro: 'E-mail já cadastrado' });

    const senha_hash = await hashSenha(senha);
    const [r] = await pool.query(
      'INSERT INTO usuarios (nome, email, telefone, documento, senha_hash) VALUES (?, ?, ?, ?, ?)',
      [nome, email, telefone || null, documento || null, senha_hash]
    );
    return res.status(201).json({ id: r.insertId, nome, email, tipo_usuario: 'CIDADÃO' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'Erro ao cadastrar' });
  }
}

export async function login(req, res) {
  try {
    const { email, senha } = req.body || {};
    console.log('[LOGIN] raw body =', req.body);
    console.log('[LOGIN] emailPresent=', !!email, 'senhaPresent=', !!senha);

    // LOGA DB ATUAL
    const [dbRow] = await pool.query('SELECT DATABASE() AS db, @@hostname AS host');
    console.log('[DB] using:', dbRow[0]);

    // LOGA SE EXISTE ESSE EMAIL
    const [rows] = await pool.query(
      'SELECT id, nome, email, senha_hash, tipo_usuario FROM usuarios WHERE email = ? LIMIT 1',
      [ (email || '').trim() ]
    );
    console.log('[LOGIN] rowsLen=', rows.length, 'emailQuer=', (email || '').trim());

    if (!rows.length) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const u = rows[0];
    console.log('[LOGIN] usuario=', { id: u.id, email: u.email });

    const ok = await compararSenha(senha, u.senha_hash);
    console.log('[LOGIN] passOK=', ok);  // true/false

    if (!ok) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: u.id, nome: u.nome, email: u.email, tipo_usuario: u.tipo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '8h' }
    );
    return res.json({ token, usuario: { id: u.id, nome: u.nome, email: u.email, tipo_usuario: u.tipo_usuario } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'Erro no login' });
  }
}


export async function me(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, nome, email, telefone, documento, tipo_usuario, criado_em, atualizado_em FROM usuarios WHERE id = ? LIMIT 1',
      [req.usuario.id]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Usuário não encontrado' });
    return res.json(rows[0]);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'Erro ao buscar perfil' });
  }
}
