# CLAUDE.md — Plataforma modular de Agenda + Cobrança + NFS-e (multi-nicho, multi-agenda)

## Como usar este arquivo
Sessão contínua no Claude Code, sem cerimônia de Spec Kit. Implemente os itens NA ORDEM. Cada item só fecha com o critério de aceite passando **em produção**. Em dúvida sobre comportamento da API Asaas: pare e pergunte, não invente campo ou endpoint.

## Visão e princípio de arquitetura
Três capacidades **independentes**, cada uma ligável ou não por negócio: **Agenda** (autoagendamento/gestão de horários), **Cobrança** (Pix/boleto recorrente e avulso via Asaas) e **NFS-e** (emissão de nota, automática ou manual). Um `business` escolhe um `plano` no onboarding, que define quais módulos estão ligados. Dentro do `business` existem 1 ou N `professional` — cada um é uma "agenda"/identidade, e cada um pode faturar pelo CNPJ/Asaas do negócio (padrão) OU pelo próprio (override), resolvendo tanto o caso "clínica com CNPJ único" quanto "clínica com PJs independentes" ou "barbearia que aluga cadeira pra MEI" com o mesmo modelo de dados.

Exemplos de combinação real:
- Barbearia que só quer agenda, cobra na maquininha: `agenda: true, cobranca: false, nfse: false`.
- Clínica com CLT (fatura pelo CNPJ da clínica) e PJ (fatura por conta própria): `cobranca: true`, e CADA `professional` decide se herda o billing do negócio ou usa o próprio.
- Quem só quer emitir nota, recebe por fora: `agenda: false, cobranca: false, nfse: true` — emissão manual, sem depender de cobrança via Asaas.
- Quem quer tudo: os três módulos ligados, preço escala pela quantidade de agendas.

## Stack (fixa)
- Next.js 15 (App Router) + TypeScript — repositório único
- MongoDB provisionado via **Vercel Marketplace** (`vercel install mongodb`)
- Auth.js (NextAuth v5) — provider Google, login só pra quem é dono da conta `business`
- Validação de input: Zod
- Pagamentos + NFS-e: API Asaas (sandbox em dev)
- Upload de imagem (foto de perfil): Vercel Blob
- E-mail transacional: Resend
- Deploy: Vercel (`vercel --prod` a cada marco fechado)

## Regras de engenharia
1. TDD nas áreas de risco real: idempotência dos webhooks, payload de NFS-e, cálculo de slots, transições de estado da assinatura, recálculo de valor por agenda, **resolução de billing config (professional vs. business)**. Resto: smoke test manual.
2. Nunca inventar endpoint/campo da API Asaas. Em dúvida, parar e perguntar.
3. Commit e deploy só com `npm run build` verde.
4. Segredos via variável de ambiente. Chave Asaas (de qualquer origem): criptografar AES-256-GCM antes de salvar.
5. Toda escrita relevante em entidade de negócio grava `audit_log`.
6. Webhooks idempotentes: mesmo evento processado 2x não duplica efeito.
7. **Módulo é checado, nunca assumido.** Toda rota/ação de Agenda, Cobrança ou NFS-e verifica `business.modulos.{agenda|cobranca|nfse}` antes de renderizar ou agir. Se o módulo estiver desligado, a rota não existe (404), não fica "desabilitada na tela".
8. **Resolução de billing config é centralizada.** Existe UMA função `resolveBillingConfig(professional, business)`: retorna `professional.billingConfig` se existir, senão `business.billingConfigPadrao`. Nenhuma outra parte do código decide isso por conta própria — toda lógica de cobrança/NFS-e chama essa função.
9. Sem dado clínico/sensível além do estritamente necessário pra cobrança e nota.
10. Nada de integração com WhatsApp Business API — confirmação é via link `wa.me`.
11. Notificação por e-mail é automática e integrada a cada feature que a usa, nunca um passo manual do profissional.
12. Provisionar o banco na mesma região das Functions da Vercel.

## Fora de escopo (não implementar)
- App mobile nativo, sincronização com Google Calendar/Outlook
- Confirmação automática por bot de WhatsApp
- Notificação por SMS/WhatsApp API — só e-mail por enquanto
- Prontuário, dado clínico, multiidioma, white-label
- Troca de plano self-service (mudar módulos depois de assinar é manual/suporte no MVP)
- Fila/mensageria — processamento síncrono (exceto cron diário da assinatura)
- Editor visual de hotsite — template único parametrizado por dados

## Data model — coleções MongoDB

```
plano (configuração comercial — seed manual via Mongo, sem CRUD próprio no MVP)
  slug, nome, descricao,
  modulos { agenda: boolean, agendaPublica: boolean, cobranca: boolean, nfse: boolean },
  precoBase (cobre a 1ª agenda), precoPorAgendaAdicional (R$ por professional além do 1º — 0 se o plano não tem agenda),
  ativo (boolean)
  Exemplos de seed: "Agenda Simples" (agenda:true, agendaPublica:true, resto false, precoBase 29, porAgenda 15);
  "Cobrança + Nota" (agenda:false, cobranca:true, nfse:true, precoBase 39, porAgenda 0);
  "Completo" (tudo true, precoBase 59, porAgenda 25)

business (conta/tenant — quem loga e paga a assinatura)
  googleId, nomeFantasia, slug (único, /agendar/{slug}), email, segmento (texto livre),
  planoId, modulos { agenda, agendaPublica, cobranca, nfse } (copiado do plano na assinatura),
  cpfCnpj (nullable),
  billingConfigPadrao (nullable — só obrigatório se modulos.cobranca ou modulos.nfse):
    { asaasApiKeyEncrypted, codigosFiscais { municipalServiceCode, nbsCode, taxSituationCode, taxClassificationCode, operationIndicatorCode } },
  onboardingStatus (PENDING|COMPLETE), createdAt, updatedAt

professional (identidade/agenda dentro do negócio — sempre existe ao menos 1, mesmo sem módulo de agenda)
  businessId, nome, slugInterno (único dentro do business),
  whatsapp (nullable, só relevante se modulos.agenda), bio, fotoUrl, redesSociais (nullable, só relevantes se modulos.agenda),
  billingConfig (nullable — override; null = herda business.billingConfigPadrao):
    { asaasApiKeyEncrypted, codigosFiscais {...}, cpfCnpj },
  ativo (boolean), createdAt, updatedAt

service
  professionalId, nome, duracaoMinutos, valor, ativo — só existe se modulos.agenda

availability
  professionalId, diaSemana, horaInicio, horaFim, slotMinutos — só existe se modulos.agenda

client
  businessId, nome, telefone, email, createdAt, updatedAt,
  tipoPessoa (FISICA|JURIDICA, nullable), cpfCnpj (nullable), inscricaoMunicipal (nullable),
  endereco {...} (nullable), dadosFiscaisToken, dadosFiscaisCompletos (boolean)

appointment
  businessId, professionalId, clientId, serviceId, dataHora,
  status (PENDING_CONFIRMATION|CONFIRMED|CANCELED|COMPLETED),
  origem (PUBLICO|MANUAL — manual pulа direto pra CONFIRMED, já que o profissional criou ele mesmo),
  recorrente (boolean), billingPlanId (nullable), createdAt, updatedAt — só existe se modulos.agenda

billing_plan
  clientId, businessId, professionalId (nullable), valor, periodicidade, diaCobranca,
  formaPagamento (PIX|BOLETO), status (ACTIVE|PAUSED|CANCELED), asaasSubscriptionId, createdAt, updatedAt
  Regra: máximo 1 plano ACTIVE por clientId. Usa resolveBillingConfig(professional, business).

payment
  businessId, professionalId (nullable), clientId, appointmentId (nullable), billingPlanId (nullable),
  asaasPaymentId (índice único), valor, vencimento,
  status (PENDING|RECEIVED|OVERDUE|REFUNDED), dataPagamento (nullable), invoiceUrl, lastEventKey, createdAt, updatedAt

invoice
  paymentId (nullable — nulo quando a nota é emitida manualmente, sem cobrança via Asaas; índice único quando presente),
  businessId, professionalId (nullable), asaasInvoiceId,
  status (PENDING_CLIENT_DATA|SCHEDULED|AUTHORIZED|ERROR|CANCELED),
  origem (AUTOMATICA|MANUAL), numero (nullable), pdfUrl (nullable), erroMsg (nullable), createdAt, updatedAt

audit_log
  entidade, entidadeId, acao, payloadResumido, timestamp

platform_subscription
  businessId (índice único), planoId, status (TRIAL|GRACE|ACTIVE|CANCELED),
  trialEndsAt (+30 dias), graceEndsAt (trialEndsAt +15 dias),
  qtdAgendasAtivas (contagem de professional ativo — só importa se plano.modulos.agenda),
  valorMensal (= plano.precoBase + max(0, qtdAgendasAtivas-1) × plano.precoPorAgendaAdicional),
  asaasSubscriptionId (conta Asaas DO PAULO), asaasPaymentIdAtual (nullable), createdAt, updatedAt

marketing_page
  slug (usado em /para/{slug}), segmento, heroTitle, heroSubtitle, features (array de strings),
  depoimento (nullable), planoId (o CTA leva ao onboarding com esse plano pré-selecionado), ativo

notification_log
  tipo, destinatarioEmail, entidadeTipo, entidadeId, status (SENT|FAILED), erroMsg (nullable), createdAt
```

## Variáveis de ambiente
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, `MONGODB_URI`, `CRYPTO_MASTER_KEY`, `ASAAS_BASE_URL`, `ASAAS_WEBHOOK_TOKEN`, `PLATFORM_ASAAS_API_KEY`, `PLATFORM_ASAAS_WEBHOOK_TOKEN`, `CRON_SECRET`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `EMAIL_FROM`

---

## Ordem de execução

Toda feature segue: **1. Implementar → 2. Testar localmente → 3. Deploy em prod → só então a próxima.**

### F0 — Esqueleto
- Implementar: `create-next-app`, Tailwind, `vercel install mongodb`, `/api/health`. Seed manual de 3 `plano` direto no Mongo (Agenda Simples, Cobrança + Nota, Completo — ver exemplos no data model).
- Testar localmente: health check OK.
- Deploy prod: placeholder no ar.
**Aceite:** `/api/health` OK e os 3 `plano` existem no banco de produção.

### F1 — Login Google + onboarding com seleção de plano
- Implementar: Auth.js Google. Onboarding lê `plano` ativos, negócio escolhe um → copia `modulos` pro `business`. Pede dados fiscais/Asaas (`billingConfigPadrao`) SOMENTE se o plano escolhido tem `cobranca` ou `nfse` true. Cria automaticamente 1 `professional` padrão.
- Testar localmente: onboarding de um plano sem cobrança/nfse NÃO pede chave Asaas nem código fiscal; onboarding de um plano com cobrança pede e valida no sandbox.
- Deploy prod: completar onboarding real nos 3 planos.
**Aceite:** os 3 fluxos de onboarding (cada plano) funcionam corretamente em produção, cada um só pedindo o que o módulo exige.

### F2 — Profissionais (agendas) + billing override
- Implementar: CRUD de `professional`. Se `modulos.cobranca` ou `modulos.nfse`, cada professional tem opção "usar Asaas/fiscal próprio" (preenche `billingConfig` dele) ou "usar o padrão do negócio" (deixa `billingConfig` null).
- Testar localmente: `resolveBillingConfig` retorna o override quando existe e o padrão quando não; chave Asaas inválida no override é rejeitada igual à do business.
- Deploy prod: um negócio com 2 professionals, um herdando e outro com Asaas próprio.
**Aceite:** os dois modelos de faturamento coexistem no mesmo `business`, em produção.

### F3 — Perfil + Serviços + Disponibilidade do profissional
- Implementar (gated por `modulos.agenda`): bio/foto (Vercel Blob)/redes sociais; CRUD de `service` e `availability` por professional.
- Testar localmente: nada disso é exposto/acessível se `modulos.agenda` for false; sobreposição de `availability` é rejeitada.
- Deploy prod: configurar de verdade num negócio com agenda ativa.
**Aceite:** professional de negócio com agenda tem perfil + serviço + disponibilidade; negócio sem o módulo nem vê essas telas.

### F4 — Agenda: pública (autoagendamento) ou manual
- Implementar: se `modulos.agendaPublica`, `GET /agendar/{businessSlug}` (com seletor se houver 2+ professionals) — fluxo de autoagendamento do cliente igual ao já especificado, `appointment.origem: PUBLICO`, status `PENDING_CONFIRMATION`, link `wa.me`. Se `modulos.agenda` true mas `agendaPublica` false, a página pública não existe (404) — o profissional cria `appointment` manualmente no painel, com `origem: MANUAL` e status já `CONFIRMED` direto (ele mesmo criou, não precisa confirmar com ele mesmo).
- Testar localmente: dois clientes não reservam o mesmo slot (caso público); criação manual não passa por `PENDING_CONFIRMATION`.
- Deploy prod: testar os dois caminhos com negócios diferentes.
**Aceite:** negócio com agenda pública recebe agendamento de cliente real; negócio com agenda privada cria e já confirma manualmente — ambos em produção.

### F5 — Motor de notificação por e-mail (infraestrutura)
- Implementar: `sendEmail(tipo, destinatario, dados)` via Resend, gravando em `notification_log` antes de enviar. Gatilho de prova: e-mail de boas-vindas no fim do onboarding (F1).
- Testar localmente: reenviar o mesmo evento não duplica.
- Deploy prod: completar onboarding e ver o e-mail chegar.
**Aceite:** infraestrutura funcionando, com 1 gatilho real disparando em produção.

### F6 — Confirmação de agendamento público
- Implementar (gated `modulos.agenda` + `agendaPublica`): lista de `PENDING_CONFIRMATION` no painel. "Confirmar" → `CONFIRMED` **+ e-mail de confirmação via F5**. Checkbox de recorrência → cria `billing_plan` (gated `modulos.cobranca`; some o checkbox se cobrança estiver desligada — agendamento recorrente sem cobrança automática simplesmente não cria billing_plan, fica só de controle de agenda).
- Testar localmente: confirmação dispara e-mail; checkbox de recorrência não aparece se `cobranca` for false.
- Deploy prod: confirmar de verdade, conferir e-mail.
**Aceite:** confirmação + notificação automática funcionando; UI reflete corretamente se cobrança está disponível ou não.

### F7 — Cobrança (avulsa e recorrente, standalone)
- Implementar (gated `modulos.cobranca`): seção "Cobranças" no painel com botão "Nova cobrança" — escolhe/cria `client`, valor, avulsa ou recorrente, forma de pagamento. Usa `resolveBillingConfig`. Se `modulos.agenda` também ativo, "Concluir atendimento" continua existindo como atalho que cria a mesma cobrança a partir do `appointment`. Cobrança gerada **dispara e-mail via F5 imediatamente**.
- Testar localmente: cobrança standalone funciona sem nenhum `appointment` envolvido; atalho via atendimento gera o mesmo tipo de registro; e-mail disparado nos dois casos.
- Deploy prod: criar cobrança standalone num negócio sem módulo de agenda.
**Aceite:** negócio "Cobrança + Nota" (sem agenda) consegue cobrar cliente direto, sem nunca ter passado por agendamento — em produção.

### F8 — Completar dados fiscais do cliente
- Implementar (gated `modulos.cobranca` OU `modulos.nfse`): página pública `/completar-dados/{token}`, CEP via ViaCEP, mesma lógica já especificada.
- Testar localmente: token inválido 404; CEP inválido rejeitado.
- Deploy prod: preencher como cliente real.
**Aceite:** funciona em produção pra qualquer negócio com cobrança ou nota ligados.

### F9 — Webhook Asaas + NFS-e automática
- Implementar (gated `modulos.cobranca` AND `modulos.nfse` juntos — emissão automática só faz sentido quando a cobrança que dispara ela também é nossa): `POST /api/webhooks/asaas`, idempotente, mesma lógica de antes, usando `resolveBillingConfig` pra saber qual chave/códigos fiscais usar na emissão. `invoice.origem: AUTOMATICA`. E-mail de nota disponível via F5.
- Testar localmente: idempotência, payload correto, e-mail disparado só em `AUTHORIZED`.
- Deploy prod: pagamento de teste real.
**Aceite:** negócio "Completo" recebe nota automática e e-mail, em produção.

### F10 — Emissão manual de nota
- Implementar (gated `modulos.nfse`, independente de `modulos.cobranca`): botão "Emitir nota" no painel — escolhe/cria `client` (precisa `dadosFiscaisCompletos`), informa valor e descrição, chama a emissão de NFS-e avulsa do Asaas diretamente (sem vincular a uma cobrança — a API do Asaas suporta nota avulsa sem cobrança atrelada). Cria `invoice` com `paymentId: null`, `origem: MANUAL`. Dispara e-mail via F5 com a nota.
- Testar localmente: bloqueia se cliente não tem dados fiscais completos (redireciona pro fluxo de completar); não exige nenhum `payment` nem `appointment`.
- Deploy prod: emitir nota manual real, sem cobrança nenhuma envolvida.
**Aceite:** negócio que só ligou `nfse` consegue emitir nota pra um cliente sem nunca ter usado agenda nem cobrança — em produção. **Isto fecha o MVP demonstrável.**

### F11 — Assinatura da plataforma (preço por plano + agenda, trial 30 dias, cancelamento em 45)
- Implementar: conta Asaas própria do Paulo (`PLATFORM_ASAAS_API_KEY`). Ao completar onboarding, cria `platform_subscription` com `planoId`, `status: TRIAL`, `trialEndsAt +30d`, `graceEndsAt +45d`, `qtdAgendasAtivas` (1 se o plano não usa agenda), `valorMensal` pela fórmula do plano. Recalcula e sincroniza no Asaas a cada criação/desativação de `professional` (só relevante se o plano tem `precoPorAgendaAdicional > 0`). Cron diário faz as transições `TRIAL→GRACE→CANCELED` e dispara e-mails via F5. Painel bloqueado em `CANCELED`, nunca as rotas públicas.
- Testar localmente: fórmula de preço pros 3 planos de exemplo; transições do cron; bloqueio só do painel.
- Deploy prod: assinar nos 3 planos, conferir valores diferentes, simular vencimento.
**Aceite:** barbearia no "Agenda Simples" paga menos que a clínica no "Completo" com 8 agendas — confirmado com números reais em produção.

### F12 — Hotsites por nicho
- Implementar: `GET /para/{slug}` lendo `marketing_page`, CTA leva ao onboarding com `planoId` pré-selecionado.
- Testar localmente: slug inativo/inexistente 404.
- Deploy prod: criar 1 hotsite real apontando pro "Agenda Simples", outro pro "Completo".
**Aceite:** dois hotsites reais, cada um pré-selecionando o plano certo, em produção.

### F13 (opcional, depois)
- Dashboard por business e por professional
- Bloqueio de horário/feriado
- Retry manual de nota com erro
- Tela de admin pra `plano` e `marketing_page` (hoje editados direto no Mongo)
- Troca de plano self-service

---

## Critério de aceite do MVP demonstrável (fecha em F10)
Validar a modularidade de verdade, não só o caminho feliz:
1. Negócio no plano **"Agenda Simples"**: tem agenda pública funcionando, NÃO vê nenhuma tela de cobrança/nota, nunca pediu chave Asaas no onboarding.
2. Negócio no plano **"Cobrança + Nota"**: SEM agenda nenhuma, cobra cliente direto (F7) e emite nota (F9 ou F10), nunca viu tela de agendamento.
3. Negócio no plano **"Completo"** com 2+ professionals: um herdando o Asaas do negócio, outro com Asaas próprio — confirmado que cada cobrança usa a chave certa.
4. Cliente final recebe e-mail de confirmação, cobrança e nota automaticamente nos casos aplicáveis, sem o profissional precisar avisar manualmente.
5. Teste de idempotência (webhook, e-mail), conflito de slot, resolução de billing config e reprocessamento de `PENDING_CLIENT_DATA` passando.
6. Tudo isso na URL pública da Vercel, não só `localhost`.

F11 e F12 são a prioridade imediata seguinte — preço diferenciado por plano/agenda e os hotsites de divulgação.
