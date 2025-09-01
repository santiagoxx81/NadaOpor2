import pool from '../../db.js';
import { getPaginacao } from '../../utils/paginacao.js';

export async function listarPalestras(req, res) {
  try {
    const { status, cidade, de, ate } = req.query;
    const { offset, limit } = getPaginacao(req.query);

    let sql = `SELECT p.*, u.nome AS nome_usuario, u.email AS email_usuario
               FROM solicitacoes_palestras p
               JOIN usuarios u ON u.id = p.usuario_id
               WHERE 1=1`;
    const params = [];

    if (status) { sql += ' AND p.status = ?'; params.push(status); }
    if (cidade) { sql += ' AND p.cidade = ?'; params.push(cidade); }
    if (de)     { sql += ' AND p.criado_em >= ?'; params.push(de); }
    if (ate)    { sql += ' AND p.criado_em <= ?'; params.push(ate); }

    sql += ' ORDER BY p.atualizado_em DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'Erro ao listar' });
  }
}

export async function alterarStatusPalestra(req, res) {
  try {
    const { protocolo } = req.params;
    const { status } = req.body;
    const permitidos = ['EM_ANALISE', 'AGENDADA', 'RECUSADA', 'FINALIZADA', 'CANCELADA'];
    if (!permitidos.includes(status)) return res.status(400).json({ erro: 'Status inválido' });

    const [r] = await pool.query('UPDATE solicitacoes_palestras SET status=? WHERE protocolo=?', [status, protocolo]);
    if (!r.affectedRows) return res.status(404).json({ erro: 'Protocolo não encontrado' });
    return res.json({ ok: true, status });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'Erro ao alterar status' });
  }
}
