import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import authRotas from './rotas/authRotas.js';
import autorizacaoEventoRotas from './rotas/autorizacaoEventoRotas.js';
import palestraRotas from './rotas/palestraRotas.js';

import adminAutorizacaoRotas from './rotas/admin/adminAutorizacaoRotas.js';
import adminPalestraRotas from './rotas/admin/adminPalestraRotas.js';

import { autenticarJWT } from './middlewares/autenticarJWT.js';
import ehAdmin from './middlewares/ehAdmin.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRotas);

// CIDADÃO (protegido)
app.use('/api/eventos/autorizacao', autenticarJWT, autorizacaoEventoRotas);
app.use('/api/palestras', autenticarJWT, palestraRotas);

// ADMIN (protegido + admin)
app.use('/api/admin/eventos/autorizacao', autenticarJWT, ehAdmin, adminAutorizacaoRotas);
app.use('/api/admin/palestras', autenticarJWT, ehAdmin, adminPalestraRotas);

export default app;
