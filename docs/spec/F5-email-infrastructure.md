# Especificação: F5 — Motor de Notificação por E-mail

## Escopo
- Infraestrutura centralizada para envio de e-mails transacionais.
- Registro de logs de notificação.

## Implementação
- **Serviço**: Usar Resend para envios.
- **Função Central**: `sendEmail(tipo, destinatario, dados)`
- **Log**: Gravar em `notification_log` com status `SENT` ou `FAILED` antes/após o envio.
- **Gatilho de Prova**: Enviar e-mail de boas-vindas ao concluir o onboarding (F1).

## Verificação
- **Local**:
    - Validar que o reprocessamento de um evento não envia e-mails duplicados (idempotência).
- **Produção**: Completar um onboarding real e verificar o recebimento do e-mail.

## Critério de Aceite
- Infraestrutura de e-mail operacional com logs persistidos e primeiro gatilho funcional em produção.
