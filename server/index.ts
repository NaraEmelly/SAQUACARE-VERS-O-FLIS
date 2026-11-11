import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ mode: 'demo', database: 'disabled' });
});

app.use('/api', (_req, res) => {
  res.status(503).json({
    message: 'A API está desativada no modo de demonstração. Nenhum dado foi salvo.',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
