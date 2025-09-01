// db.js
import dotenv from 'dotenv';
dotenv.config(); // <- garante variáveis disponíveis mesmo se executarem app.js direto

import mysql from 'mysql2/promise';

const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`[ERRO .env] Variável ausente: ${k}`);
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,       // se vier undefined -> seu erro do log
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
