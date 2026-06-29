# Especificação: F0008 — Dados Fiscais do Cliente

## Escopo
- Coleta de dados necessários para emissão de nota fiscal (CPF/CNPJ, endereço).
- Gated: `modulos.cobranca: true` OU `modulos.nfse: true`.

## Implementação
- **Página Pública**: `/completar-dados/{token}`.
- **Funcionalidades**:
    - Busca de CEP via API ViaCEP.
    - Validação de CPF/CNPJ.
    - Atualização do objeto `client` com `dadosFiscaisCompletos: true`.
- **Fluxo**: Clientes sem dados fiscais completos são redirecionados para esta página através de links enviados em e-mails de cobrança ou nota.

## Verificação
- **Local**:
    - Validar que tokens inválidos retornam 404.
    - Validar rejeição de CEPs inexistentes ou formatos inválidos.
- **Produção**: Preencher dados como um cliente real e verificar atualização no banco.

## Critério de Aceite
- Coleta de dados fiscais funcional e integrada ao cadastro de clientes.
