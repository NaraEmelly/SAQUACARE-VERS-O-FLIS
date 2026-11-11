
<div align="center">

<img width="124" height="124" alt="image" src="https://github.com/user-attachments/assets/522da0c1-c0de-4c3f-9200-2f1738066c68" />

**Sistema de Gerenciamento de Atendimentos em Saúde**

Engenharia de Software • Universidade de Vassouras • 2026

**Requirements Document | v1.0**

</div>


## Objetivo
Desenvolver um sistema de gerenciamento de atendimentos em unidades de saúde das redes pública e privada, com o objetivo de otimizar o fluxo de pacientes, reduzir o tempo de espera e facilitar o acesso aos serviços de saúde.

O sistema disponibilizará funcionalidades como acompanhamento de filas em tempo real, agendamento de consultas, prontuário digital, comunicação com profissionais de saúde, carteira de vacinação digital, lembretes de medicamentos, consulta de unidades de saúde próximas, contatos de emergência, entre outras funcionalidades.

```Observação: recursos relacionados a medicamentos e receitas devem atuar como apoio informativo, sem substituir a avaliação ou orientação de um profissional de saúde.```

---

## Usuários do Sistema
  - Administrador: responsável pelo gerenciamento geral da plataforma, usuários, unidades e configurações do sistema.
  - Médicos/Enfermeiros: responsáveis pelo atendimento dos pacientes e gerenciamento das informações relacionadas aos atendimentos.
  - Pacientes: usuários que utilizam o sistema para agendamentos, acompanhamento de filas, consultas e acesso às suas informações.
  - Recepção/Secretaria: responsável pelo gerenciamento de agendamentos, organização das filas e atendimento administrativo aos pacientes.

## Problemas Identificados
Durante a análise do contexto de atendimento em unidades de saúde, foram identificados os seguintes problemas:
  - Processos realizados de forma manual;
  - Unidades de saúde frequentemente lotadas;
  - Necessidade de comparecimento presencial para realizar determinados agendamentos;
  - Tempo elevado de espera em filas;
  - Dificuldade de acesso rápido às informações dos serviços de saúde;
  - Sistemas desatualizados ou pouco integrados;
  - Falta de acompanhamento do fluxo de atendimento em tempo real;
  - Dificuldade para localizar unidades de saúde próximas;
  - Falta de centralização das informações do paciente;
  - Comunicação limitada entre pacientes e unidades de saúde.

# Requisitos Funcionais e Não Funcionais do Sistema SaquaCare

## 1. Requisitos Funcionais

Os Requisitos Funcionais (RF) descrevem as funcionalidades e comportamentos que o sistema SaquaCare deverá disponibilizar aos seus usuários.

### 1.1 Cadastro e Autenticação

**[RF01] Cadastro de usuário**  
O sistema deve permitir que novos usuários realizem seu cadastro, fornecendo as informações necessárias para sua identificação e utilização da plataforma.

**[RF02] Validação de cadastro**  
O sistema deve validar os dados obrigatórios informados durante o cadastro e impedir a conclusão quando houver informações ausentes ou inválidas.

**[RF03] Autenticação de usuário**  
O sistema deve permitir que usuários cadastrados realizem login por meio de suas credenciais de acesso.

**[RF04] Validação das credenciais**  
O sistema deve verificar as credenciais informadas durante o login e impedir o acesso quando os dados forem inválidos.

**[RF05] Recuperação de acesso**  
O sistema deve permitir que o usuário solicite a recuperação de sua senha ou acesso à conta.

**[RF06] Encerramento de sessão**  
O sistema deve permitir que o usuário encerre sua sessão de forma segura.

**[RF07] Controle de acesso por perfil**  
O sistema deve disponibilizar funcionalidades de acordo com o perfil de acesso do usuário, considerando usuários/pacientes, profissionais de saúde e administradores.

### 1.2 Gerenciamento do Perfil

**[RF08] Visualização do perfil**  
O sistema deve permitir que o usuário visualize seus dados cadastrais e informações vinculadas à sua conta.

**[RF09] Atualização do perfil**  
O sistema deve permitir que o usuário atualize seus dados cadastrais, respeitando as informações que podem ser alteradas pelo próprio usuário.

**[RF10] Gerenciamento de credenciais**  
O sistema deve permitir que o usuário altere sua senha mediante autenticação adequada.

### 1.3 Agendamento de Atendimentos

**[RF11] Consulta de unidades de atendimento**  
O sistema deve permitir que o usuário consulte as unidades de saúde disponíveis na plataforma.

**[RF12] Consulta de especialidades e serviços**  
O sistema deve permitir que o usuário consulte as especialidades e serviços disponíveis para atendimento.

**[RF13] Consulta de disponibilidade**  
O sistema deve apresentar os horários disponíveis para agendamento de acordo com a unidade, serviço ou profissional selecionado.

**[RF14] Realização de agendamento**  
O sistema deve permitir que o usuário realize o agendamento de um atendimento disponível.

**[RF15] Confirmação de agendamento**  
O sistema deve apresentar ao usuário a confirmação do agendamento realizado, contendo as informações necessárias para sua identificação.

**[RF16] Visualização de agendamentos**  
O sistema deve permitir que o usuário visualize seus atendimentos agendados.

**[RF17] Cancelamento de agendamento**  
O sistema deve permitir que o usuário solicite o cancelamento de um atendimento, respeitando as regras estabelecidas pelo sistema.

**[RF18] Reagendamento de atendimento**  
O sistema deve permitir que o usuário solicite a alteração da data ou horário de um atendimento quando houver disponibilidade.

**[RF19] Histórico de atendimentos**  
O sistema deve permitir que o usuário consulte o histórico de seus atendimentos registrados na plataforma, respeitando as permissões de acesso.

### 1.4 Gerenciamento de Filas

**[RF20] Consulta da fila de atendimento**  
O sistema deve permitir que o usuário consulte informações referentes à sua posição ou situação na fila de atendimento, quando esse recurso estiver disponível para a unidade.

**[RF21] Atualização da situação da fila**  
O sistema deve atualizar as informações relacionadas à fila conforme os registros realizados pelos profissionais ou responsáveis pelo atendimento.

**[RF22] Identificação da situação do atendimento**  
O sistema deve informar ao usuário o status de seu atendimento, como aguardando, em atendimento, concluído ou situação equivalente definida pelo sistema.

**[RF23] Gerenciamento da fila pelos profissionais**  
O sistema deve permitir que usuários autorizados gerenciem a fila de atendimento de acordo com suas permissões.

### 1.5 Prontuário e Informações de Atendimento

**[RF24] Registro de informações de atendimento**  
O sistema deve permitir que profissionais autorizados registrem informações relacionadas aos atendimentos realizados.

**[RF25] Consulta de informações do prontuário**  
O sistema deve permitir que profissionais autorizados consultem informações do prontuário digital conforme suas permissões de acesso.

**[RF26] Atualização do prontuário**  
O sistema deve permitir que profissionais autorizados atualizem informações do prontuário relacionadas aos atendimentos realizados.

**[RF27] Histórico do prontuário**  
O sistema deve manter o histórico das informações registradas no prontuário, respeitando as regras de segurança e integridade dos dados.

**[RF28] Restrição de acesso ao prontuário**  
O sistema deve restringir o acesso às informações do prontuário de acordo com o perfil e as permissões do usuário.

### 1.6 Carteira de Vacinação

**[RF29] Consulta da carteira de vacinação**  
O sistema deve permitir que o usuário consulte suas informações de vacinação registradas na plataforma.

**[RF30] Registro de vacinação**  
O sistema deve permitir que profissionais autorizados registrem informações referentes às vacinas administradas.

**[RF31] Atualização do histórico de vacinação**  
O sistema deve permitir que profissionais autorizados atualizem os registros de vacinação conforme os procedimentos realizados.

**[RF32] Consulta do histórico de vacinação**  
O sistema deve apresentar ao usuário o histórico de vacinas registradas em sua conta, conforme as permissões estabelecidas.

### 1.7 Medicamentos

**[RF33] Cadastro de informações sobre medicamentos**  
O sistema deve permitir que informações relacionadas aos medicamentos utilizados pelo usuário sejam registradas quando essa funcionalidade estiver disponível e autorizada.

**[RF34] Consulta de medicamentos**  
O sistema deve permitir que o usuário consulte as informações de medicamentos registradas em seu perfil.

**[RF35] Gerenciamento de lembretes de medicamentos**  
O sistema deve permitir o cadastro, alteração e exclusão de lembretes relacionados aos medicamentos do usuário, quando essa funcionalidade estiver disponível.

### 1.8 Comunicação

**[RF36] Comunicação entre usuário e atendimento**  
O sistema deve disponibilizar um mecanismo de comunicação entre usuários e profissionais ou responsáveis pelo atendimento, conforme as permissões estabelecidas.

**[RF37] Envio de mensagens**  
O sistema deve permitir que usuários autorizados enviem mensagens relacionadas ao atendimento.

**[RF38] Recebimento de mensagens**  
O sistema deve permitir que usuários autorizados recebam e consultem mensagens relacionadas aos serviços disponibilizados.

**[RF39] Histórico de comunicação**  
O sistema deve manter o histórico das comunicações realizadas por meio da plataforma, respeitando as regras de segurança e retenção de dados.

### 1.9 Funcionalidades para Profissionais de Saúde

**[RF40] Acesso do profissional**  
O sistema deve permitir que profissionais de saúde autorizados realizem autenticação em uma área específica da plataforma.

**[RF41] Visualização da agenda profissional**  
O sistema deve permitir que profissionais autorizados consultem seus atendimentos agendados.

**[RF42] Gerenciamento de atendimentos**  
O sistema deve permitir que profissionais autorizados atualizem o status dos atendimentos sob sua responsabilidade.

**[RF43] Gerenciamento da fila de atendimento**  
O sistema deve permitir que profissionais autorizados consultem e atualizem a fila de atendimento de acordo com suas permissões.

**[RF44] Registro de atendimento**  
O sistema deve permitir que profissionais autorizados registrem informações referentes aos atendimentos realizados.

**[RF45] Consulta de informações do usuário**  
O sistema deve permitir que profissionais autorizados consultem somente as informações necessárias para a realização do atendimento, conforme suas permissões.

### 1.10 Funcionalidades Administrativas

**[RF46] Acesso administrativo**  
O sistema deve permitir que administradores autorizados acessem uma área administrativa da plataforma.

**[RF47] Gerenciamento de usuários**  
O administrador deve poder consultar, cadastrar, editar, bloquear ou desativar usuários conforme suas permissões.

**[RF48] Gerenciamento de profissionais**  
O administrador deve poder gerenciar os profissionais autorizados a utilizar a plataforma.

**[RF49] Gerenciamento de unidades de saúde**  
O administrador deve poder cadastrar, editar, consultar e desativar unidades de atendimento disponibilizadas no sistema.

**[RF50] Gerenciamento de serviços**  
O administrador deve poder cadastrar e atualizar os serviços e especialidades disponibilizados pelas unidades.

**[RF51] Gerenciamento de horários**  
O administrador ou usuário autorizado deve poder configurar os horários disponíveis para atendimento.

**[RF52] Gerenciamento de permissões**  
O sistema deve permitir que administradores autorizados definam ou alterem permissões de acesso de acordo com os perfis existentes.

### 1.11 Relatórios e Acompanhamento

**[RF53] Consulta de informações administrativas**  
O sistema deve permitir que usuários administrativos consultem informações relacionadas aos atendimentos registrados na plataforma.

**[RF54] Geração de relatórios**  
O sistema deve permitir a geração de relatórios relacionados aos dados administrativos e operacionais do sistema, conforme as permissões de acesso.

**[RF55] Consulta de indicadores**  
O sistema poderá apresentar indicadores relacionados aos atendimentos, agendamentos e utilização do sistema, preferencialmente utilizando dados agregados ou anonimizados quando não houver necessidade de identificação individual.

### 1.12 Segurança e Auditoria

**[RF56] Registro de atividades**  
O sistema deve registrar determinadas atividades relevantes realizadas pelos usuários para fins de segurança, auditoria e rastreabilidade.

**[RF57] Controle de sessões**  
O sistema deve controlar as sessões dos usuários autenticados e impedir o acesso não autorizado após o encerramento ou expiração da sessão.

**[RF58] Bloqueio de acesso indevido**  
O sistema deve aplicar mecanismos para impedir ou limitar tentativas de acesso consideradas suspeitas ou não autorizadas.

**[RF59] Proteção de dados pessoais**  
O sistema deve aplicar mecanismos de proteção aos dados pessoais armazenados e processados pela plataforma.

---

# 2. Requisitos Não Funcionais

Os Requisitos Não Funcionais (RNF) estabelecem características de qualidade, restrições e condições de funcionamento que o SaquaCare deverá atender.

## 2.1 Usabilidade

**[RNF01] Interface intuitiva**  
O sistema deve possuir uma interface simples, organizada e intuitiva, permitindo que usuários com diferentes níveis de familiaridade tecnológica compreendam suas principais funcionalidades.

**[RNF02] Facilidade de navegação**  
As funcionalidades principais devem ser acessíveis por meio de uma estrutura de navegação clara e consistente.

**[RNF03] Responsividade**  
A interface deve adaptar-se adequadamente a diferentes tamanhos de tela, incluindo computadores, tablets e dispositivos móveis.

**[RNF04] Consistência visual**  
O sistema deve manter padrões consistentes de cores, tipografia, botões, ícones, menus e componentes de interface.

**[RNF05] Mensagens de erro**  
O sistema deve apresentar mensagens claras para informar erros, problemas de preenchimento ou ações que não puderam ser concluídas.

**[RNF06] Feedback das operações**  
O sistema deve informar ao usuário o resultado de ações importantes, como cadastro, login, agendamento, cancelamento e atualização de informações.

## 2.2 Acessibilidade

**[RNF07] Acessibilidade da interface**  
O sistema deve buscar atender às boas práticas de acessibilidade digital, permitindo que diferentes perfis de usuários consigam utilizar suas funcionalidades.

**[RNF08] Legibilidade**  
Textos, botões e elementos de interface devem possuir tamanho e contraste adequados para facilitar a leitura.

**[RNF09] Navegação acessível**  
Os principais elementos da interface devem possuir identificação clara e organização que facilite a navegação.

**[RNF10] Compatibilidade com tecnologias assistivas**  
A interface deve buscar compatibilidade com tecnologias assistivas, sempre que tecnicamente aplicável.

## 2.3 Desempenho

**[RNF11] Tempo de resposta**  
O sistema deve responder às operações comuns em tempo adequado, evitando atrasos que prejudiquem a experiência do usuário.

**[RNF12] Processamento de requisições**  
O sistema deve ser capaz de processar múltiplas requisições simultâneas sem comprometer significativamente suas funcionalidades principais.

**[RNF13] Carregamento das páginas**  
As páginas e componentes da aplicação devem ser carregados de maneira otimizada, evitando recursos desnecessários.

**[RNF14] Gerenciamento de recursos**  
O sistema deve utilizar de forma eficiente os recursos disponíveis no servidor, banco de dados e dispositivos dos usuários.

## 2.4 Segurança

**[RNF15] Autenticação segura**  
O sistema deve utilizar mecanismos adequados para autenticação e controle de acesso dos usuários.

**[RNF16] Proteção de senhas**  
As senhas dos usuários não devem ser armazenadas em formato de texto puro, devendo ser protegidas por mecanismos apropriados de hash.

**[RNF17] Controle de autorização**  
O sistema deve garantir que cada usuário tenha acesso somente às funcionalidades e informações compatíveis com suas permissões.

**[RNF18] Proteção contra acesso não autorizado**  
O sistema deve possuir mecanismos para reduzir riscos de acesso indevido às contas e informações armazenadas.

**[RNF19] Proteção das comunicações**  
As comunicações entre cliente e servidor devem utilizar protocolos seguros, como HTTPS/TLS, quando aplicável.

**[RNF20] Proteção de dados sensíveis**  
Informações relacionadas à saúde e outros dados pessoais sensíveis devem receber medidas adicionais de proteção compatíveis com sua natureza.

**[RNF21] Registro de eventos de segurança**  
Eventos relevantes de autenticação, acesso e alterações de informações devem poder ser registrados para fins de auditoria e segurança.

**[RNF22] Sessões seguras**  
As sessões autenticadas devem possuir mecanismos de expiração e encerramento seguro.

## 2.5 Privacidade e LGPD

**[RNF23] Conformidade com a LGPD**  
O tratamento de dados pessoais realizado pelo sistema deve observar os princípios e requisitos aplicáveis da Lei nº 13.709/2018.

**[RNF24] Minimização de dados**  
O sistema deve coletar somente os dados necessários para a execução das funcionalidades disponibilizadas.

**[RNF25] Controle sobre dados pessoais**  
O sistema deve possibilitar, quando tecnicamente aplicável, o atendimento às solicitações relacionadas aos direitos dos titulares previstos na LGPD.

**[RNF26] Rastreabilidade do tratamento**  
O sistema deve manter mecanismos que permitam identificar operações relevantes realizadas sobre dados pessoais, respeitando as finalidades e prazos aplicáveis.

**[RNF27] Privacidade por padrão**  
As configurações da plataforma devem priorizar a proteção e a exposição mínima dos dados pessoais dos usuários.

## 2.6 Confiabilidade e Disponibilidade

**[RNF28] Disponibilidade**  
O sistema deve permanecer disponível durante os períodos definidos para utilização da plataforma, exceto em situações de manutenção ou indisponibilidade técnica.

**[RNF29] Recuperação de falhas**  
O sistema deve possuir mecanismos que permitam recuperar suas operações após falhas técnicas, quando aplicável.

**[RNF30] Integridade dos dados**  
O sistema deve preservar a integridade dos dados armazenados, evitando alterações ou exclusões indevidas.

**[RNF31] Backup**  
Os dados considerados necessários para a continuidade do serviço devem possuir mecanismos de cópia de segurança, conforme a infraestrutura adotada.

**[RNF32] Consistência das informações**  
O sistema deve evitar registros duplicados, inconsistentes ou conflitantes durante operações de cadastro, agendamento e atualização.

## 2.7 Compatibilidade

**[RNF33] Compatibilidade com navegadores**  
A aplicação web deve funcionar adequadamente nos principais navegadores modernos, como Google Chrome, Microsoft Edge, Mozilla Firefox e Opera.

**[RNF34] Compatibilidade com dispositivos**  
O sistema deve apresentar funcionamento adequado em computadores e dispositivos móveis compatíveis com a aplicação.

**[RNF35] Compatibilidade com diferentes resoluções**  
A interface deve adaptar seus componentes às diferentes resoluções de tela disponíveis.

## 2.8 Manutenibilidade

**[RNF36] Organização do código**  
O código-fonte deve ser organizado de maneira modular, facilitando manutenção, correção de erros e evolução do sistema.

**[RNF37] Padronização**  
O desenvolvimento deve seguir padrões de codificação definidos pela equipe, buscando manter uniformidade entre os componentes do projeto.

**[RNF38] Documentação técnica**  
Os principais componentes, funcionalidades, configurações e procedimentos necessários à manutenção do sistema devem possuir documentação adequada.

**[RNF39] Controle de versões**  
O código-fonte deve ser gerenciado por meio de um sistema de controle de versões, permitindo acompanhar alterações realizadas durante o desenvolvimento.

**[RNF40] Separação de responsabilidades**  
A arquitetura do sistema deve buscar separar adequadamente as responsabilidades relacionadas à interface, regras de negócio, processamento e persistência de dados.

## 2.9 Escalabilidade

**[RNF41] Capacidade de expansão**  
A arquitetura do sistema deve permitir a inclusão de novas funcionalidades sem exigir alterações completas na estrutura existente.

**[RNF42] Crescimento de usuários**  
O sistema deve ser projetado considerando a possibilidade de aumento progressivo no número de usuários cadastrados.

**[RNF43] Expansão das unidades**  
A estrutura do sistema deve permitir a inclusão de novas unidades de atendimento sem necessidade de reconstrução completa da aplicação.

## 2.10 Portabilidade e Implantação

**[RNF44] Portabilidade da aplicação**  
A aplicação deve utilizar tecnologias que permitam sua execução nos ambientes previamente definidos pela equipe de desenvolvimento.

**[RNF45] Configuração por ambiente**  
As configurações específicas de desenvolvimento, testes e produção devem ser separadas sempre que tecnicamente aplicável.

**[RNF46] Facilidade de implantação**  
O projeto deve possuir procedimentos documentados para instalação, configuração e execução da aplicação.

## 2.11 Arquitetura e Tecnologia

**[RNF47] Arquitetura modular**  
O sistema deve possuir uma arquitetura organizada em componentes ou módulos que permitam manutenção e evolução independentes sempre que possível.

**[RNF48] Integração entre componentes**  
Os componentes do sistema devem utilizar interfaces de comunicação definidas e consistentes.

**[RNF49] Banco de dados**  
As informações persistentes do sistema devem ser armazenadas em um banco de dados adequado às necessidades da aplicação, garantindo integridade e consistência dos registros.

**[RNF50] API e comunicação entre camadas**  
Quando utilizada uma arquitetura baseada em frontend e backend, a comunicação entre as camadas deve ocorrer por meio de interfaces bem definidas e mecanismos adequados de autenticação e segurança.

---

```Os requisitos apresentados constituem uma base para o desenvolvimento e documentação do SaquaCare. Eles poderão ser refinados durante as etapas de análise, prototipação, desenvolvimento, testes e validação.```

É importante manter a rastreabilidade entre os requisitos, os diagramas de casos de uso, BPMN, modelo conceitual/DER, arquitetura da aplicação e funcionalidades implementadas, garantindo que os diferentes artefatos do projeto representem o mesmo escopo do sistema.

## Diagrama de Caso de Uso
Mostra quem utiliza o sistema e o que cada usuário pode fazer.
<img width="3671" height="3167" alt="svgviewer-png-output (2)" src="https://github.com/user-attachments/assets/a0f96a90-3313-406f-9a4f-cbffd716510e" />

## DER - Diagrama de Entidade-Relacionamento
Mostra como os dados do SaquaCare se relacionam no banco de dados.
<img width="1168" height="827" alt="image" src="https://github.com/user-attachments/assets/6930b024-1da1-4c2a-aa26-93d31339d58b" />

## BPMN 
Esse é ótimo para mostrar o processo de atendimento, do início ao fim.
<img width="1600" height="1196" alt="image" src="https://github.com/user-attachments/assets/70b9ac97-d7f6-4447-8eda-3ac19050afa0" />

# Escopo do Sistema
O SaquaCare tem como escopo o desenvolvimento de uma plataforma para gerenciamento e acompanhamento de atendimentos em unidades de saúde, buscando melhorar a organização dos serviços, reduzir o tempo de espera e facilitar o acesso dos pacientes às informações relacionadas aos atendimentos.

O sistema contemplará diferentes níveis de acesso, de acordo com o perfil do usuário, permitindo o gerenciamento de pacientes, profissionais, atendimentos, agendamentos e filas.

Funcionalidades contempladas no escopo:
- Cadastro e autenticação de usuários;
- Gerenciamento de perfis de usuários;
- Agendamento de consultas e atendimentos;
- Gerenciamento das filas de atendimento;
- Acompanhamento da posição na fila;
- Gerenciamento de atendimentos pela recepção;
- Cadastro e gerenciamento de profissionais;
- Cadastro e gerenciamento de unidades de saúde;
- Consulta de informações das unidades;
- Registro e consulta do histórico de atendimentos;
- Prontuário digital, conforme o nível de acesso;
- Gerenciamento de informações relacionadas à vacinação;
- Lembretes relacionados a medicamentos;
- Comunicação entre paciente e unidade de saúde;
- Consulta de unidades de saúde próximas;
- Disponibilização de contatos de emergência;
- Gerenciamento administrativo do sistema;
- Geração de informações e relatórios para apoio à gestão.
- Fora do escopo inicial
  


```Nesta primeira versão, o sistema não terá como objetivo substituir sistemas oficiais de saúde, realizar diagnósticos médicos ou fornecer prescrições médicas automatizadas. Funcionalidades que dependam de integrações externas, como sistemas governamentais ou bases de dados de terceiros, poderão ser consideradas em versões futuras.```


## Tecnologia Utilizadas
O desenvolvimento do SaquaCare utilizará tecnologias voltadas para a construção da interface, desenvolvimento do sistema, gerenciamento dos dados e controle do projeto.
```
| Tecnologia                    | Utilização                                                   |
| ----------------------------- | ------------------------------------------------------------ |
| **React**                     | Desenvolvimento da interface da aplicação                    |
| **Vite**                      | Ferramenta de build e ambiente de desenvolvimento front-end  |
| **TypeScript / TSX**          | Desenvolvimento dos componentes e funcionalidades do sistema |
| **HTML5**                     | Estruturação das páginas                                     |
| **CSS3**                      | Estilização e responsividade da interface                    |
| **Node.js**                   | Desenvolvimento do ambiente e serviços do back-end           |
| **Banco de Dados Relacional** | Armazenamento e gerenciamento das informações                |
| **Git**                       | Controle de versão do código                                 |
| **GitHub**                    | Hospedagem do repositório e colaboração entre os integrantes |
| **VSCode**                    | Ambiente de desenvolvimento                                  |
| **BPMN**                      | Modelagem dos processos do sistema                           |
| **DER**                       | Modelagem e representação do banco de dados                  |
```




