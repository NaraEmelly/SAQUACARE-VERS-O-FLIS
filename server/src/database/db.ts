import { readFileSync } from 'node:fs';
import { Pool } from 'pg';
import dotenv from 'dotenv';



dotenv.config();



const obrigatorias = [
  'DB_USER',
  'DB_HOST',
  'DB_NAME',
  'DB_PASSWORD',
  'DB_PORT',
];

for (const variavel of obrigatorias) {
  if (!process.env[variavel]) {
    throw new Error(`Configure ${variavel} no .env do servidor.`);
  }
}

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),

  ssl: {
  rejectUnauthorized: true,
  ca: readFileSync('./supabase-ca.crt', 'utf8'),
  },

  connectionTimeoutMillis: 10000,
});