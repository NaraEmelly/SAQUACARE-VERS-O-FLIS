# SaquaCare — modo de demonstração

O protótipo deve ser executado sem conexão com PostgreSQL. Cadastro e login
estão desativados; **Acessar demonstração** abre a área de demonstração sem
autenticação. Agendamentos de exemplo ficam apenas no armazenamento local do
navegador e não são enviados ao servidor.

O formulário pode encaminhar feedbacks automaticamente para
`saquacare2026@gmail.com` usando Google Apps Script. Para habilitar, siga os
passos de configuração no [README principal](../README.md) e configure
`VITE_GOOGLE_APPS_SCRIPT_URL`. Sem essa configuração, o formulário oferece
o e-mail como alternativa. Nenhuma resposta é gravada no banco de dados.

A demonstração inclui o widget VLibras oficial, carregado de
`https://vlibras.gov.br/app/vlibras-plugin.js`, e por isso requer internet para
essa ferramenta. O restante das opções de acessibilidade funciona no navegador.

## Executar o frontend

Na raiz do projeto:

```bash
npm install
npm run dev
```

Não é necessário iniciar o servidor da pasta `server/` nem configurar um banco
de dados para a demonstração. Se o servidor for iniciado, ele disponibiliza
somente `/api/health`; as demais rotas `/api` retornam `503` e não acessam o
banco de dados.
