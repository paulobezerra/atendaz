# Especificação: F0010 — Emissão Manual de Nota

## Escopo
- Capacidade de emitir NFS-e de forma avulsa, sem cobrança atrelada no Asaas.
- Habilitado por: `modulos.nfse: true`.

## Implementação
- **Botão "Emitir Nota"**: Disponível no painel.
- **Fluxo**: Escolher cliente -> Informar valor e descrição -> Chamar API de NFS-e avulsa do Asaas.
- **Requisito**: Cliente deve ter `dadosFiscaisCompletos: true`. Se não tiver, redirecionar para o fluxo de coleta (F8).
- **Registro**: Criar `invoice` com `paymentId: null` e `origem: MANUAL`.
- **Notificação**: Enviar e-mail com a nota ao cliente (F5).

## Verificação
- **Local**:
    - Validar bloqueio de emissão para clientes com dados incompletos.
    - Validar que a emissão não exige vínculo com `payment` ou `appointment`.
- **Produção**: Emitir uma nota manual real em um negócio que possui apenas o módulo NFS-e.

## Critério de Aceite (Finaliza MVP)
- Possibilidade de emitir notas para clientes que pagam por fora da plataforma.
- Fluxo de validação de dados fiscais integrado.
