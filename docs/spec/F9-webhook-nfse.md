# Especificação: F9 — Webhook Asaas e NFS-e Automática

## Escopo
- Processamento de pagamentos confirmados via Asaas.
- Emissão automática de nota fiscal de serviço.
- Gated: `modulos.cobranca: true` AND `modulos.nfse: true`.

## Implementação
- **Webhook**: Endpoint `POST /api/webhooks/asaas`.
- **Idempotência**: Verificar se o evento já foi processado antes de agir.
- **Emissão de Nota**:
    - Gatilho: Pagamento confirmado.
    - Origem: `AUTOMATICA`.
    - Usar `resolveBillingConfig` para obter chaves e códigos fiscais.
- **Notificação**: Enviar e-mail com a nota fiscal assim que o status for `AUTHORIZED` (F5).

## Verificação
- **Local**:
    - Simular payloads do Asaas e validar idempotência.
    - Validar que o e-mail só é enviado em caso de sucesso na autorização.
- **Produção**: Realizar um pagamento de teste e validar emissão automática da nota.

## Critério de Aceite
- Fluxo completo "Pagamento -> Nota -> E-mail" funcionando de forma autônoma e resiliente.
