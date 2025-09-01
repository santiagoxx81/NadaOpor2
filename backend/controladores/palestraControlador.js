import pool from "../db.js";
import { gerarProtocolo } from "../utils/protocolo.js";

export async function listarMinhasPalestras(req, res) {
  try {
    const userId = req.usuario.id;
    const [rows] = await pool.query(
      `SELECT id, protocolo, organizacao, cidade, estado, temas, status, criado_em
       FROM solicitacoes_palestras
       WHERE usuario_id = ?
       ORDER BY criado_em DESC`,
      [userId]
    );
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: "Falha ao listar suas palestras" });
  }
}

export async function criarSolicitacaoPalestra(req, res) {
  try {
    const usuario_id = req.usuario.id;
    const {
      organizacao,
      endereco,
      bairro,
      cidade,
      estado,
      cep,
      temas,
      publico_alvo,
      qtd_pessoas,
      data_sugerida,
      observacoes,
    } = req.body;
    const protocolo = gerarProtocolo("PL");
    const [r] = await pool.query(
      `INSERT INTO solicitacoes_palestras
       (usuario_id, protocolo, organizacao, endereco, bairro, cidade, estado, cep, temas, publico_alvo, qtd_pessoas, data_sugerida, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario_id,
        protocolo,
        organizacao || null,
        endereco,
        bairro,
        cidade,
        estado,
        cep || null,
        temas,
        publico_alvo || null,
        qtd_pessoas || null,
        data_sugerida,
        observacoes || null,
      ]
    );
    return res
      .status(201)
      .json({ id: r.insertId, protocolo, status: "RECEBIDA" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: "Erro ao criar solicitação" });
  }
}

export async function obterPalestraPorProtocolo(req, res) {
  try {
    const { protocolo } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM solicitacoes_palestras WHERE protocolo=? LIMIT 1",
      [protocolo]
    );
    if (!rows.length)
      return res.status(404).json({ erro: "Protocolo não encontrado" });
    const reg = rows[0];
    if (
      req.usuario.tipo_usuario !== "ADMIN" &&
      reg.usuario_id !== req.usuario.id
    ) {
      return res.status(403).json({ erro: "Sem permissão" });
    }
    return res.json(reg);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: "Erro na consulta" });
  }
}

export async function editarSolicitacaoPalestra(req, res) {
  try {
    const { protocolo } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM solicitacoes_palestras WHERE protocolo=? LIMIT 1",
      [protocolo]
    );
    if (!rows.length)
      return res.status(404).json({ erro: "Protocolo não encontrado" });
    const reg = rows[0];
    if (reg.status !== "RECEBIDA")
      return res
        .status(400)
        .json({ erro: "Edição não permitida neste status" });
    if (reg.usuario_id !== req.usuario.id)
      return res.status(403).json({ erro: "Sem permissão" });

    const {
      organizacao,
      endereco,
      bairro,
      cidade,
      estado,
      cep,
      temas,
      publico_alvo,
      qtd_pessoas,
      data_sugerida,
      observacoes,
    } = req.body;
    await pool.query(
      `UPDATE solicitacoes_palestras SET
        organizacao=?, endereco=?, bairro=?, cidade=?, estado=?, cep=?, temas=?, publico_alvo=?, qtd_pessoas=?, data_sugerida=?, observacoes=?
       WHERE protocolo=?`,
      [
        organizacao || null,
        endereco,
        bairro,
        cidade,
        estado,
        cep || null,
        temas,
        publico_alvo || null,
        qtd_pessoas || null,
        data_sugerida,
        observacoes || null,
        protocolo,
      ]
    );
    const [at] = await pool.query(
      "SELECT atualizado_em FROM solicitacoes_palestras WHERE protocolo=?",
      [protocolo]
    );
    return res.json({ ok: true, atualizado_em: at[0].atualizado_em });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: "Erro ao editar" });
  }
}

export async function cancelarSolicitacaoPalestra(req, res) {
  try {
    const { protocolo } = req.params;
    const [rows] = await pool.query(
      "SELECT usuario_id, status FROM solicitacoes_palestras WHERE protocolo=? LIMIT 1",
      [protocolo]
    );
    if (!rows.length)
      return res.status(404).json({ erro: "Protocolo não encontrado" });
    const reg = rows[0];
    if (reg.status !== "RECEBIDA")
      return res
        .status(400)
        .json({ erro: "Cancelamento não permitido neste status" });
    if (reg.usuario_id !== req.usuario.id)
      return res.status(403).json({ erro: "Sem permissão" });

    await pool.query(
      'UPDATE solicitacoes_palestras SET status="CANCELADA" WHERE protocolo=?',
      [protocolo]
    );
    return res.json({ ok: true, status: "CANCELADA" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: "Erro ao cancelar" });
  }
}
