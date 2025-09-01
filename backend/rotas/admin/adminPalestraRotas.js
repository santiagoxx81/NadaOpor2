import { Router } from 'express';
import { listarPalestras, alterarStatusPalestra } from '../../controladores/admin/adminPalestraControlador.js';

const router = Router();
router.get('/', listarPalestras);
router.patch('/:protocolo/status', alterarStatusPalestra);
export default router;
