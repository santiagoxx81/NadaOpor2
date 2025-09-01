import { Router } from 'express';
import { listarAutorizacoes, alterarStatusAutorizacao, atualizarPendenciaAutorizacao } from '../../controladores/admin/adminAutorizacaoControlador.js';

const router = Router();
router.get('/', listarAutorizacoes);
router.patch('/:protocolo/status', alterarStatusAutorizacao);
router.patch('/:protocolo/pendencia', atualizarPendenciaAutorizacao);
export default router;
