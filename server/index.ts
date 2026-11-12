import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
  }),
);

app.get('/api/health', (_request, response) => {
  response.json({
    mode: 'demo',
    database: 'disabled',
    assistant: 'local',
  });
});

app.use('/api', (_request, response) => {
  response.status(503).json({
    message: 'A API de demonstração está desativada. O assistente funciona localmente no navegador.',
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de demonstração disponível na porta ${PORT}`);
});
