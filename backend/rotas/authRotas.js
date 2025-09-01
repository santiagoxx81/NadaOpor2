import { Router } from 'express';
import { cadastrar, login, me } from '../controladores/authControlador.js';
import { autenticarJWT } from '../middlewares/autenticarJWT.js';

const router = Router();
router.post('/cadastrar', cadastrar);
router.post('/login', login);
router.get('/me', autenticarJWT, me);
export default router;
