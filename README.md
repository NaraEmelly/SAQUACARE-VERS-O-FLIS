# SAQUACARE

Sistema de gestão de saúde desenvolvido com React + TypeScript + Vite.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** CSS Modules
- **State Management:** React Context
- **Routing:** React Router DOM
- **HTTP Client:** Axios

## Getting Started

## Modo de demonstração

O protótipo não exige cadastro, login ou conexão com banco de dados. Na página
inicial, **Acessar demonstração** abre a área demonstrativa diretamente.
Agendamentos de exemplo ficam apenas no armazenamento local do navegador.
O formulário pode encaminhar avaliações por e-mail para
`saquacare2026@gmail.com` usando Google Apps Script, sem banco de dados ou
login para quem visita. A mensagem só é enviada automaticamente depois de
configurar e publicar o script; sem essa configuração, o formulário mostra o
link de e-mail como alternativa.

### Configurar o envio automático de feedback

1. Abra [script.google.com](https://script.google.com) na conta Google que
   receberá os feedbacks e crie um projeto.
2. Copie o conteúdo de [`google-apps-script/Code.gs`](./google-apps-script/Code.gs)
   para o editor e salve.
3. Selecione **Implantar > Nova implantação > Aplicativo da Web**. Configure
   para executar como sua conta e permita acesso de qualquer pessoa. Autorize o
   envio de e-mails quando o Google solicitar e copie a URL terminada em `/exec`.
4. Copie `.env.example` para `.env.local` e informe a URL:

   ```env
   VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/SEU_ID/exec
   ```

5. Reinicie o Vite localmente. Em produção, configure a mesma variável nas
   variáveis de ambiente da hospedagem e gere um novo build.

O endpoint público pode ser acessado por qualquer pessoa; o script valida os
campos e usa um campo honeypot simples contra envios automatizados. As respostas
são encaminhadas por e-mail, não gravadas em um banco de dados. Não use o
formulário para informações pessoais ou de saúde. O envio está sujeito às
permissões e aos limites de envio da conta Google.

A área profissional também pode ser aberta diretamente pela landing page.
O widget VLibras é carregado do serviço oficial (`vlibras.gov.br`), portanto
precisa de conexão com a internet; a ferramenta de acessibilidade também inclui
atalho para o conteúdo, ajuste de tamanho do texto, alto contraste, escala de
cinza, destaque de links, espaçamento ampliado e leitura em voz alta.
O guia virtual Luma responde a perguntas frequentes usando conteúdo preparado
pela equipe e percorre as telas em um tour local. As respostas são selecionadas
no próprio navegador: não há chamada a serviços de IA, chave ou cobrança por
provedor. Como não é uma IA generativa, a Luma pode não entender perguntas fora
dos assuntos preparados. A conversa fica apenas na memória da página e
desaparece ao atualizá-la ou fechá-la. Não envie dados pessoais ou clínicos. A
Luma oferece informações gerais sobre o projeto, não diagnóstico nem orientação
médica individual. A voz em português do Brasil pode ser selecionada no painel;
o reconhecimento de voz depende do suporte e das permissões do navegador e o
processamento de áudio pode depender de serviços fornecidos pelo navegador.
Os dados de exemplo do protótipo são fictícios e ficam no armazenamento local do
navegador.

### Luma local

A Luma funciona junto com o frontend, sem configurar servidor de IA ou variáveis
de ambiente. Para desenvolvê-la, execute `npm install` e `npm run dev` na raiz.
As respostas preparadas cobrem dúvidas sobre agendamentos demonstrativos, fila,
vacinação, unidades, acessibilidade, cadastro, privacidade e recursos do
projeto. Para perguntas fora dessa base, a Luma informa suas limitações.

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── assets/          # Static assets (images, icons, logos, fonts)
├── components/      # Reusable UI components
├── pages/           # Application pages/routes
├── layouts/         # Layout components
├── routes/          # Route definitions
├── services/        # API services
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── styles/          # Global styles and CSS variables
├── utils/           # Utility functions
└── constants/       # Application constants
```

## License

MIT