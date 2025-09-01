import { Router } from 'express';
import {
  criarSolicitacaoPalestra,
  obterPalestraPorProtocolo,
  editarSolicitacaoPalestra,
  cancelarSolicitacaoPalestra,
  listarMinhasPalestras
} from '../controladores/palestraControlador.js';

const router = Router();
router.get('/', listarMinhasPalestras);
router.post('/', criarSolicitacaoPalestra);
router.get('/:protocolo', obterPalestraPorProtocolo);
router.put('/:protocolo', editarSolicitacaoPalestra);
router.post('/:protocolo/cancelar', cancelarSolicitacaoPalestra);
export default router;
