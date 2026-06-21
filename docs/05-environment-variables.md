# Variáveis de Ambiente

Este documento descreve as variáveis necessárias para o funcionamento da plataforma. Certifique-se de preenchê-las no arquivo `.env.local` (desenvolvimento) e no painel da Vercel (produção).

## Autenticação (Google + NextAuth)
- `GOOGLE_CLIENT_ID`: ID do cliente OAuth 2.0 obtido no Google Cloud Console.
- `GOOGLE_CLIENT_SECRET`: Segredo do cliente OAuth 2.0.
- `AUTH_SECRET`: Chave aleatória para criptografia dos cookies de sessão (gerar com `openssl rand -base64 32`).

## Banco de Dados
- `MONGODB_URI`: String de conexão com o MongoDB (Vercel Marketplace ou Atlas).

## Segurança e Criptografia
- `CRYPTO_MASTER_KEY`: Chave mestre (32 caracteres) para criptografia AES-256-GCM das chaves de API do Asaas.

## Integração Asaas (Tenants/Profissionais - Sandbox/Prod)
- `ASAAS_BASE_URL`: URL base da API (Ex: `https://sandbox.asaas.com/api/v3` ou `https://api.asaas.com/v3`).
- `ASAAS_WEBHOOK_TOKEN`: Token configurado no Asaas para validar que o webhook recebido é autêntico.

## Plataforma (Paulo - Cobrança da Assinatura)
- `PLATFORM_ASAAS_API_KEY`: Chave de API da conta Asaas do Paulo.
- `PLATFORM_ASAAS_WEBHOOK_TOKEN`: Token de validação do webhook da conta do Paulo.

## Infraestrutura e Serviços
- `CRON_SECRET`: Token de segurança para proteger rotas de tarefas agendadas (Cron Jobs).
- `BLOB_READ_WRITE_TOKEN`: Token para o Vercel Blob Storage (fotos de perfil).
- `RESEND_API_KEY`: Chave de API do Resend para envio de e-mails transacionais.
- `EMAIL_FROM`: Endereço de e-mail que aparecerá como remetente (Ex: `Atendaz <contato@atendaz.com.br>`).

## Tabela de Obrigatoriedade por Fase

| Variável | Fase Inicial Obrigatória |
| :--- | :--- |
| `MONGODB_URI` | F0 (Esqueleto) |
| `GOOGLE_CLIENT_ID/SECRET`, `AUTH_SECRET` | F1 (Onboarding) |
| `CRYPTO_MASTER_KEY` | F1 (Onboarding) |
| `ASAAS_BASE_URL` | F1 (Onboarding) |
| `RESEND_API_KEY`, `EMAIL_FROM` | F5 (Notificações) |
| `PLATFORM_ASAAS_API_KEY` | F11 (Assinatura Plataforma) |
