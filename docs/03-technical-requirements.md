# Requisitos Técnicos

## Stack Fixa
- **Framework**: Next.js (Versão Estável Mais Recente) + TypeScript.
- **Banco de Dados**: MongoDB via Vercel Marketplace (`vercel install mongodb`).
- **Autenticação**: Auth.js (NextAuth v5) - Provider Google (login apenas para donos de conta `business`).
- **Validação**: Zod.
- **Pagamentos & Fiscal**: API Asaas (sandbox em desenvolvimento).
- **Uploads**: Vercel Blob (fotos de perfil).
- **E-mail Transacional**: Resend.
- **Deploy**: Vercel (`vercel --prod`).

## Regras de Engenharia
1. **Ambiente de Execução**: SEMPRE utilizar a versão **Node.js 24.x** (conforme recomendado pela Vercel).
2. **Tolerância Zero a Vulnerabilidades**: O sistema não aceita dependências com falhas de segurança conhecidas. O comando `npm audit` deve retornar zero falhas.
3. **Dependências de Ponta**: Utilizar sempre as versões estáveis mais recentes de frameworks e bibliotecas (ex: Next.js, React, Mongoose).
4. **TDD em Áreas Críticas**: Idempotência de webhooks, payloads de NFS-e, cálculo de slots, transições de assinatura, recálculo de valor por agenda e resolução de billing config.
2. **API Asaas**: Nunca inventar endpoints ou campos. Em dúvida, consultar documentação ou suporte.
3. **Build**: Commit e deploy apenas com `npm run build` bem-sucedido.
4. **Segurança**: Variáveis de ambiente para segredos. Chaves Asaas criptografadas com AES-256-GCM antes de persistir.
5. **Audit Log**: Gravar `audit_log` para toda escrita relevante em entidades de negócio.
6. **Idempotência**: Webhooks devem ser processados sem duplicar efeitos.
7. **Verificação de Módulos**: Toda rota/ação deve verificar `business.modulos` antes de agir. Se o módulo estiver desligado, retornar 404.
8. **Resolução de Billing**: Centralizada na função `resolveBillingConfig(professional, business)`.
9. **Privacidade**: Sem dados clínicos ou sensíveis além do estritamente necessário para cobrança e nota.
10. **Notificações**: E-mail automático integrado às features; sem WhatsApp Business API (usar link `wa.me`).
11. **Infraestrutura**: Provisionar banco na mesma região das Vercel Functions.
