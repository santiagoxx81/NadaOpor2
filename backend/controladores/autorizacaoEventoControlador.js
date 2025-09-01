import pool from "../db.js";
import { gerarProtocolo } from "../utils/protocolo.js";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import mime from "mime-types";

export async function criarAutorizacaoEvento(req, res) {
  try {
    const protocolo = gerarProtocolo("AE");
    const usuario_id = req.usuario.id;
    const {
      titulo,
      descricao,
      tipo_evento,
      endereco,
      bairro,
      cidade,
      estado,
      cep,
      data_inicio,
      data_fim,
      publico_estimado,
      observacoes,
    } = req.body;

    const [r] = await pool.query(
      `INSERT INTO autorizacoes_eventos
       (usuario_id, protocolo, titulo, descricao, tipo_evento, endereco, bairro, cidade, estado, cep,
        data_inicio, data_fim, publico_estimado, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario_id,
        protocolo,
        titulo,
        descricao || null,
        tipo_evento || null,
        endereco,
        bairro,
        cidade,
        estado,
        cep || null,
        data_inicio,
        data_fim,
        publico_estimado || null,
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

export async function obterPorProtocolo(req, res) {
  try {
    const { protocolo } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM autorizacoes_eventos WHERE protocolo = ? LIMIT 1",
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

export async function editarAutorizacaoEvento(req, res) {
  try {
    const { protocolo } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM autorizacoes_eventos WHERE protocolo = ? LIMIT 1",
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
      titulo,
      descricao,
      tipo_evento,
      endereco,
      bairro,
      cidade,
      estado,
      cep,
      data_inicio,
      data_fim,
      publico_estimado,
      observacoes,
    } = req.body;

    await pool.query(
      `UPDATE autorizacoes_eventos SET
         titulo=?, descricao=?, tipo_evento=?, endereco=?, bairro=?, cidade=?, estado=?, cep=?,
         data_inicio=?, data_fim=?, publico_estimado=?, observacoes=?
       WHERE protocolo=?`,
      [
        titulo,
        descricao || null,
        tipo_evento || null,
        endereco,
        bairro,
        cidade,
        estado,
        cep || null,
        data_inicio,
        data_fim,
        publico_estimado || null,
        observacoes || null,
        protocolo,
      ]
    );
    const [atualizado] = await pool.query(
      "SELECT atualizado_em FROM autorizacoes_eventos WHERE protocolo=?",
      [protocolo]
    );
    return res.json({ ok: true, atualizado_em: atualizado[0].atualizado_em });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: "Erro ao editar" });
  }
}

export async function cancelarAutorizacaoEvento(req, res) {
  try {
    const { protocolo } = req.params;
    const [rows] = await pool.query(
      "SELECT usuario_id, status FROM autorizacoes_eventos WHERE protocolo = ? LIMIT 1",
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
      'UPDATE autorizacoes_eventos SET status="CANCELADA" WHERE protocolo=?',
      [protocolo]
    );
    return res.json({ ok: true, status: "CANCELADA" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: "Erro ao cancelar" });
  }
}
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_MB || 10) * 1024 * 1024;
const EXT_PERMITIDAS = new Set([".pdf", ".jpg", ".jpeg", ".png"]);

function isAdmin(req) {
  return req?.usuario?.tipo_usuario === "ADMIN";
}
function isOwner(req, recurso) {
  return recurso?.usuario_id === req?.usuario?.id;
}

async function buscarAEPorProtocolo(protocolo) {
  const [r] = await pool.query(
    "SELECT * FROM autorizacoes_eventos WHERE protocolo=? LIMIT 1",
    [protocolo]
  );
  return r.length ? r[0] : null;
}

function slug(str = "") {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

// ===== ANEXOS =====

export async function listarAnexos(req, res) {
  try {
    const { protocolo } = req.params;
    const ae = await buscarAEPorProtocolo(protocolo);
    if (!ae) return res.status(404).json({ erro: "Nada Opor não encontrado" });
    if (!isAdmin(req) && !isOwner(req, ae))
      return res.status(403).json({ erro: "Sem permissão" });

    const [rows] = await pool.query(
      "SELECT id, nome_original, caminho_ou_chave, mime, tamanho_bytes, criado_em FROM anexos_autorizacao WHERE autorizacao_evento_id=? ORDER BY criado_em DESC",
      [ae.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao listar anexos" });
  }
}

export async function anexarArquivoGravado(req, res) {
  try {
    const { protocolo } = req.params;
    const ae = await buscarAEPorProtocolo(protocolo);
    if (!ae) return res.status(404).json({ erro: "Nada Opor não encontrado" });

    // regra: só anexar quando RECEBIDA ou admin (ajuste se quiser permitir em outros status)
    if (
      !isAdmin(req) &&
      (!isOwner(req, ae) ||
        !["RECEBIDA", "EM_ANALISE", "PENDENTE"].includes(ae.status))
    ) {
      return res
        .status(403)
        .json({ erro: "Não é permitido anexar neste status" });
    }

    if (!req.file) return res.status(400).json({ erro: "Arquivo ausente" });
    const {
      originalname,
      size,
      path: savedPath,
      mimetype,
      filename,
    } = req.file;

    if (size > MAX_UPLOAD_BYTES) {
      // apaga arquivo salvo acima do limite
      await fs.rm(savedPath, { force: true });
      return res.status(400).json({ erro: "Arquivo excede o tamanho máximo" });
    }

    await pool.query(
      `INSERT INTO anexos_autorizacao
       (autorizacao_evento_id, nome_original, caminho_ou_chave, mime, tamanho_bytes)
       VALUES (?, ?, ?, ?, ?)`,
      [ae.id, originalname, savedPath, mimetype, size]
    );

    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao anexar arquivo" });
  }
}

export async function baixarAnexo(req, res) {
  try {
    const { id } = req.params;
    const [[row]] = await pool.query(
      `SELECT a.*, ae.protocolo, ae.usuario_id
         FROM anexos_autorizacao a
         JOIN autorizacoes_eventos ae ON ae.id = a.autorizacao_evento_id
        WHERE a.id=? LIMIT 1`,
      [id]
    );
    if (!row) return res.status(404).json({ erro: "Anexo não encontrado" });
    if (!isAdmin(req) && !isOwner(req, row))
      return res.status(403).json({ erro: "Sem permissão" });

    res.setHeader("Content-Type", row.mime || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${slug(row.nome_original)}"`
    );
    return res.sendFile(path.resolve(row.caminho_ou_chave));
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao baixar anexo" });
  }
}

export async function excluirAnexo(req, res) {
  try {
    const { id } = req.params;
    const [[row]] = await pool.query(
      `SELECT a.*, ae.status, ae.usuario_id
         FROM anexos_autorizacao a
         JOIN autorizacoes_eventos ae ON ae.id = a.autorizacao_evento_id
        WHERE a.id=? LIMIT 1`,
      [id]
    );
    if (!row) return res.status(404).json({ erro: "Anexo não encontrado" });

    // regra: cidadão só pode excluir na RECEBIDA; admin pode sempre
    if (!isAdmin(req)) {
      if (!isOwner(req, row))
        return res.status(403).json({ erro: "Sem permissão" });
      if (row.status !== "RECEBIDA")
        return res
          .status(400)
          .json({ erro: "Não é possível excluir neste status" });
    }

    // apaga arquivo físico (ignora erro se não existir)
    try {
      await fs.rm(row.caminho_ou_chave, { force: true });
    } catch {}
    await pool.query("DELETE FROM anexos_autorizacao WHERE id=?", [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao excluir anexo" });
  }
}
export async function listarMinhasAutorizacoes(req, res) {
  try {
    const userId = req.usuario.id;
    const [rows] = await pool.query(
      `SELECT id, protocolo, titulo, cidade, estado, status, criado_em
       FROM autorizacoes_eventos
       WHERE usuario_id = ?
       ORDER BY criado_em DESC`,
      [userId]
    );
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: "Falha ao listar suas autorizações" });
  }
}
