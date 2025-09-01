import pool from '../../db.js';
import { getPaginacao } from '../../utils/paginacao.js';

export async function listarAutorizacoes(req, res) {
  try {
    const { status, cidade, de, ate } = req.query;
    const { offset, limit } = getPaginacao(req.query);

    let sql = `SELECT a.*, u.nome AS nome_usuario, u.email AS email_usuario
               FROM autorizacoes_eventos a
               JOIN usuarios u ON u.id = a.usuario_id
               WHERE 1=1`;
    const params = [];

    if (status) { sql += ' AND a.status = ?'; params.push(status); }
    if (cidade) { sql += ' AND a.cidade = ?'; params.push(cidade); }
    if (de)     { sql += ' AND a.criado_em >= ?'; params.push(de); }
    if (ate)    { sql += ' AND a.criado_em <= ?'; params.push(ate); }

    sql += ' ORDER BY a.atualizado_em DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'Erro ao listar' });
  }
}

// ... no topo já deve ter: import pool from '../../db.js';

export async function alterarStatusAutorizacao(req, res) {
  try {
    const { protocolo } = req.params;
    const { status, pendencia_obs } = req.body;

    const permitidos = ['EM_ANALISE','PENDENTE','APROVADA','RECUSADA','FINALIZADA','CANCELADA'];
    if (!permitidos.includes(status)) {
      return res.status(400).json({ erro: 'Status inválido' });
    }

    if (status === 'PENDENTE') {
      if (!pendencia_obs || !String(pendencia_obs).trim()) {
        return res.status(400).json({ erro: 'Descreva a pendência (pendencia_obs é obrigatório quando status = PENDENTE)' });
      }
      const [r] = await pool.query(
        'UPDATE autorizacoes_eventos SET status=?, pendencia_obs=? WHERE protocolo=?',
        [status, String(pendencia_obs).trim(), protocolo]
      );
      if (r.affectedRows === 0) return res.status(404).json({ erro: 'Autorização não encontrada' });
      return res.json({ ok: true, status, pendencia_obs: String(pendencia_obs).trim() });
    } else {
      const [r] = await pool.query(
        'UPDATE autorizacoes_eventos SET status=?, pendencia_obs=NULL WHERE protocolo=?',
        [status, protocolo]
      );
      if (r.affectedRows === 0) return res.status(404).json({ erro: 'Autorização não encontrada' });
      return res.json({ ok: true, status, pendencia_obs: null });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'Erro ao alterar status' });
  }
}


export async function atualizarPendenciaAutorizacao(req, res) {
  try {
    const { protocolo } = req.params;
    let { pendente, obs } = req.body;

    const valor = (pendente === true || pendente === 1 || pendente === '1' || pendente === 'true') ? 1 : 0;

    const [r] = await pool.query(
      'UPDATE autorizacoes_eventos SET pendente=?, pendente_obs=? WHERE protocolo=?',
      [valor, obs ?? null, protocolo]
    );
    if (r.affectedRows === 0) return res.status(404).json({ erro: 'Autorização não encontrada' });

    res.json({ ok: true, pendente: !!valor });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao atualizar pendência' });
  }
}
