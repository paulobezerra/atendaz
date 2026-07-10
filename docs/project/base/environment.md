# Variáveis de Ambiente

Este documento descreve as variáveis necessárias para o funcionamento da plataforma. Certifique-se de preenchê-las no arquivo `.env.local` (desenvolvimento) e no painel da Vercel → **Settings → Environment Variables** (produção).

> **Escopo por fase.** A lista cobre o **MVP completo** (F0–F11). Em produção hoje (**F0–F2.8**) o código só usa: `MONGODB_URI`, `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, `CRYPTO_MASTER_KEY`, `ASAAS_BASE_URL`. As demais (Resend/e-mail, webhooks, `PLATFORM_ASAAS_API_KEY`, cron, Blob) só passam a ser exigidas quando suas fases forem implementadas — ver a tabela por fase abaixo.

> Para cada variável, a linha **Onde obter** indica a origem. Variáveis "gerar local" são criadas por você no terminal; não precisam de serviço externo.

## Autenticação (Google + NextAuth)
- `GOOGLE_CLIENT_ID`: ID do cliente OAuth 2.0.
  - **Onde obter**: [Google Cloud Console](https://console.cloud.google.com) → criar/selecionar projeto → **APIs e Serviços** → **Tela de consentimento OAuth** (configurar tipo Externo) → **Credenciais** → *Criar credenciais* → **ID do cliente OAuth** → tipo **Aplicativo da Web**. Copiar o **Client ID** gerado.
- `GOOGLE_CLIENT_SECRET`: Segredo do cliente OAuth 2.0.
  - **Onde obter**: mesma tela de Credenciais acima — copiar o **Client Secret**.
  - **Importante**: em **URIs de redirecionamento autorizados**, cadastrar os dois: `http://localhost:3000/api/auth/callback/google` e `https://<seu-dominio>.vercel.app/api/auth/callback/google`.
- `AUTH_SECRET`: Chave aleatória para assinatura/criptografia da sessão (JWT/cookies).
  - **Onde obter**: gerar local — `openssl rand -base64 32` (ou `npx auth secret`).
- `AUTH_URL` / `NEXTAUTH_URL` (se exigido pelo Auth.js v5 em produção): URL base do deploy (ex.: `https://<seu-dominio>.vercel.app`).
  - **Onde obter**: a URL do projeto na Vercel.

## Banco de Dados
- `MONGODB_URI`: String de conexão com o MongoDB.
  - **Onde obter**: [MongoDB Atlas](https://cloud.mongodb.com) → cluster **M0 (free)** → botão **Connect** → **Drivers** → copiar a string. Alternativa: **Vercel → Storage/Integrations → MongoDB Atlas** (injeta a env automaticamente). Formato: `mongodb+srv://<user>:<senha>@<cluster>.mongodb.net/atendaz?retryWrites=true&w=majority`.

## Segurança e Criptografia
- `CRYPTO_MASTER_KEY`: Chave mestre (32 caracteres) para criptografia AES-256-GCM das chaves de API do Asaas.
  - **Onde obter**: gerar local — `openssl rand -base64 32`. (AES-256 exige 32 bytes; a lib de `crypto` da aplicação faz o tratamento/derivação para o tamanho correto.)

## Integração Asaas (Tenants/Profissionais - Sandbox/Prod)
- `ASAAS_BASE_URL`: URL base da API.
  - **Onde obter**: valor fixo — sandbox `https://sandbox.asaas.com/api/v3`; produção `https://api.asaas.com/v3`.
- `ASAAS_WEBHOOK_TOKEN`: Token para validar que o webhook recebido é autêntico.
  - **Onde obter**: você **define** um token ao cadastrar o webhook no painel Asaas (Integrações → Webhooks) e repete o mesmo valor nesta variável.

> Chave de API Asaas de um Tenant/Profissional **não** é variável de ambiente: é digitada no wizard de onboarding e armazenada criptografada (AES-256-GCM). Para testes, crie uma conta em `sandbox.asaas.com` → **Integrações → API** e gere uma chave (`$aact_...`).

## Plataforma (Paulo - Cobrança da Assinatura)
- `PLATFORM_ASAAS_API_KEY`: Chave de API da conta Asaas do Paulo.
  - **Onde obter**: conta Asaas do Paulo (produção) → **Integrações → API** → gerar/copiar a chave.
- `PLATFORM_ASAAS_WEBHOOK_TOKEN`: Token de validação do webhook da conta do Paulo.
  - **Onde obter**: definido por você ao cadastrar o webhook na conta Asaas do Paulo; repetir o mesmo valor aqui.

## Infraestrutura e Serviços
- `CRON_SECRET`: Token para proteger rotas de tarefas agendadas (Cron Jobs).
  - **Onde obter**: gerar local — `openssl rand -base64 32`.
- `BLOB_READ_WRITE_TOKEN`: Token do Vercel Blob Storage (fotos de perfil). **Crie o store como
  Público** — as fotos aparecem na página pública de agendamento, e o código usa `put({access:'public'})`;
  um store **Privado** quebra o upload (a Vercel não deixa trocar o acesso depois — recrie Público).
  - **Onde obter**: **Vercel → Storage → Blob** → criar store → copiar o token gerado.
- `RESEND_API_KEY`: Chave de API do Resend para envio de e-mails transacionais.
  - **Onde obter**: [resend.com](https://resend.com) → **API Keys** → *Create*.
- `EMAIL_FROM`: Endereço de remetente (Ex: `Atendaz <contato@atendaz.com.br>`).
  - **Onde obter**: um remetente de **domínio verificado** no Resend (Resend → Domains → adicionar e verificar o domínio via DNS).

## Tabela de Obrigatoriedade por Fase

| Variável | Fase Inicial Obrigatória |
| :--- | :--- |
| `MONGODB_URI` | F0 (Esqueleto) |
| `GOOGLE_CLIENT_ID/SECRET`, `AUTH_SECRET` | F1 (Onboarding) |
| `CRYPTO_MASTER_KEY` | F1 (Onboarding) |
| `ASAAS_BASE_URL` | F1 (Onboarding) |
| `RESEND_API_KEY`, `EMAIL_FROM` | F5 (Notificações) |
| `PLATFORM_ASAAS_API_KEY` | F11 (Assinatura Plataforma) |
