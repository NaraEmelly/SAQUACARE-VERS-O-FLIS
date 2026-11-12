# Servidor de demonstração SaquaCare

O assistente Luma não usa este servidor: suas respostas locais são preparadas
no frontend e não precisam de chave, serviço externo ou configuração de API.

Este servidor mínimo existe apenas para verificar a saúde do ambiente de
demonstração. Ele não conecta nem grava dados em banco. Para iniciá-lo:

```sh
npm install
npm run dev
```

`GET /api/health` informa o modo de demonstração. O chat não envia mensagens
para este servidor.
