# Modelo de Dados — Coleções MongoDB

## plano
Configuração comercial (seed manual via Mongo).
- `slug`, `nome`, `descricao`
- `modulos`: `{ agenda: boolean, agendaPublica: boolean, cobranca: boolean, nfse: boolean }`
- `precoBase`: Cobre a 1ª agenda.
- `precoPorAgendaAdicional`: R$ por professional além do 1º (0 se sem agenda).
- `ativo`: boolean.
- *Exemplos*: "Agenda Simples", "Cobrança + Nota", "Completo".

## business
Conta/tenant principal.
- `googleId`, `nomeFantasia`, `slug` (único, `/agendar/{slug}`), `email`, `segmento`.
- `planoId`, `modulos` (copiado do plano na assinatura).
- `cpfCnpj` (nullable).
- `billingConfigPadrao` (nullable): 
  { 
    asaasApiKeyEncrypted, 
    nfseStrategy (AUTO_AFTER_PAYMENT|MANUAL_PER_PAYMENT|MANUAL_BATCH),
    codigosFiscais { municipalServiceCode, nbsCode, taxSituationCode, taxClassificationCode, operationIndicatorCode } 
  }.
- `onboardingStatus` (PENDING|COMPLETE).
- `createdAt`, `updatedAt`.

## professional
Identidade/agenda (mínimo 1 por business).
- `businessId`, `nome`, `slugInterno` (único no business).
- `whatsapp`, `bio`, `fotoUrl`, `redesSociais` (nullable).
- `billingConfig` (nullable - override; null = herda business):
    { 
      asaasApiKeyEncrypted, 
      nfseStrategy,
      codigosFiscais {...}, 
      cpfCnpj 
    }.
- `ativo`: boolean.
- `createdAt`, `updatedAt`.

## service
- `professionalId`, `nome`, `duracaoMinutos`, `valor`, `ativo`.
- *Regra*: Só existe se `modulos.agenda`.

## availability
- `professionalId`, `diaSemana`, `horaInicio`, `horaFim`, `slotMinutos`.
- *Regra*: Só existe se `modulos.agenda`.

## client
- `businessId`, `nome`, `telefone`, `email`.
- `tipoPessoa` (FISICA|JURIDICA), `cpfCnpj`, `inscricaoMunicipal` (nullable).
- `endereco` (nullable), `dadosFiscaisToken`, `dadosFiscaisCompletos`: boolean.

## appointment
- `businessId`, `professionalId`, `clientId`, `serviceId`, `dataHora`.
- `status` (PENDING_CONFIRMATION|CONFIRMED|CANCELED|COMPLETED).
- `origem` (PUBLICO|MANUAL).
- `recorrente`: boolean, `billingPlanId` (nullable).

## billing_plan
Plano de cobrança recorrente para o Cliente Final.
- `clientId`, `businessId`, `professionalId` (opcional - apenas referência).
- `valor`, `periodicidade`, `diaCobranca`.
- `formaPagamento` (PIX|BOLETO), `status` (ACTIVE|PAUSED|CANCELED), `asaasSubscriptionId`.
- *Regra*: Vinculado ao **Business** (Tenant). O token Asaas usado é definido pelo Business (seja o padrão ou override do profissional no momento da criação). Máximo 1 plano ACTIVE por cliente por Business.

## payment
- `businessId`, `professionalId` (nullable), `clientId`, `appointmentId` (nullable), `billingPlanId` (nullable).
- `asaasPaymentId` (índice único), `valor`, `vencimento`.
- `status` (PENDING|RECEIVED|OVERDUE|REFUNDED), `dataPagamento`, `invoiceUrl`.

## invoice
- `paymentId` (nullable - nulo se emissão manual).
- `businessId`, `professionalId` (nullable), `asaasInvoiceId`.
- `status` (PENDING_CLIENT_DATA|SCHEDULED|AUTHORIZED|ERROR|CANCELED).
- `origem` (AUTOMATICA|MANUAL), `numero`, `pdfUrl`, `erroMsg`.
- *Regra*: Emissão manual ou revisão é feita pelo Gestor do Tenant ou pelo Profissional.

## audit_log
- `entidade`, `entidadeId`, `acao`, `payloadResumido`, `timestamp`.

## platform_subscription
Assinatura do negócio com a plataforma (Paulo).
- `businessId` (único), `planoId`, `status` (TRIAL|GRACE|ACTIVE|CANCELED).
- `trialEndsAt`, `graceEndsAt`.
- `qtdAgendasAtivas`, `valorMensal`.
- `asaasSubscriptionId`, `asaasPaymentIdAtual`.

## marketing_page
- `slug` (ex: `/para/{slug}`), `segmento`, `heroTitle`, `heroSubtitle`, `features`.
- `depoimento`, `planoId` (CTA leva ao onboarding), `ativo`.

## notification_log
- `tipo`, `destinatarioEmail`, `entidadeTipo`, `entidadeId`, `status`, `erroMsg`.
