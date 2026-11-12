# Servidor de demonstração SaquaCare

O servidor não conecta nem grava dados em banco. Para ativar a conversa com a
Luma, assistente SaquaCare AI, configure a API Claude da Anthropic:

1. Copie `.env.example` para `.env` e preencha `ANTHROPIC_API_KEY`. A chave
   permanece no servidor; nunca use uma variável `VITE_` para ela.
2. Instale as dependências e inicie o serviço:

   ```powershell
   npm install
   npm run dev
   ```

3. Inicie o frontend em outro terminal, na raiz do repositório, com `npm run
   dev`. O proxy do Vite encaminha `/api` para `http://127.0.0.1:3000`.

O endpoint `POST /api/chat` valida tamanho e formato da conversa, limita
solicitações, aplica filtros de privacidade antes de encaminhar as mensagens à
Anthropic e não registra o conteúdo das conversas. O histórico é transitório
no navegador e fica limitado às mensagens recentes. Esses filtros não garantem
a remoção de todo dado identificável; visitantes não devem enviar informações
pessoais ou clínicas. O uso da IA requer consentimento explícito no painel e
pode gerar custos. A Anthropic processa as mensagens conforme suas políticas.

`GET /api/health` informa se a chave está configurada, sem revelar seu valor.
Configure `CORS_ORIGINS` com as origens permitidas ao publicar o backend.
`ANTHROPIC_MODEL` pode ser alterado no ambiente; o padrão é
`claude-sonnet-5-5`.
