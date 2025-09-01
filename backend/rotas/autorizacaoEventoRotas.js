import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import {
  criarAutorizacaoEvento,
  obterPorProtocolo,
  editarAutorizacaoEvento,
  cancelarAutorizacaoEvento,
  listarAnexos,
  anexarArquivoGravado,
  baixarAnexo,
  excluirAnexo,
  listarMinhasAutorizacoes   
 } from '../controladores/autorizacaoEventoControlador.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const EXT_PERMITIDAS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { protocolo } = req.params;
      const pasta = path.join(UPLOAD_DIR, 'AE', String(protocolo));
      await fs.mkdir(pasta, { recursive: true });
      cb(null, pasta);
    } catch (e) {
      cb(e, '');
    }
  },
  filename: (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const base = path.basename(file.originalname || 'arquivo', ext);
  const safeBase = base.replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').toLowerCase();
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const tipo = (req.body?.tipo_documento || 'outro').toString().toLowerCase();
  cb(null, `${tipo}__${unique}__${safeBase}${ext}`);
}

});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!EXT_PERMITIDAS.has(ext)) return cb(new Error('Extensão não permitida'), false);
  cb(null, true);
}
const upload = multer({ storage, fileFilter });


const router = Router();
router.post('/', criarAutorizacaoEvento);
router.get('/', listarMinhasAutorizacoes);   // <--- NOVA ROTA: lista SOMENTE do usuário autenticado
router.post('/', criarAutorizacaoEvento);
router.get('/:protocolo', obterPorProtocolo);
router.put('/:protocolo', editarAutorizacaoEvento);
router.post('/:protocolo/cancelar', cancelarAutorizacaoEvento);
// ANEXOS (Nada Opor)
router.get('/:protocolo/anexos', listarAnexos);
router.post('/:protocolo/anexos', upload.single('arquivo'), anexarArquivoGravado);
router.get('/anexos/:id/download', baixarAnexo);
router.delete('/anexos/:id', excluirAnexo);

export default router;
