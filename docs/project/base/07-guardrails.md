# Guardrails e Regras de Negócio Inegociáveis

Este documento centraliza as regras críticas que garantem a integridade, segurança e o modelo de negócio da plataforma. **Nenhuma alteração de código pode violar estas regras.**

## 1. Hierarquia e Identidade (Multi-tenant)
- **Isolamento Total**: Um Tenant (Business) NUNCA pode acessar dados de outro Tenant. Todas as queries ao banco devem incluir `businessId`.
- **Diferenciação**:
    - **Plataforma**: Gerenciada pelo Paulo.
    - **Tenant (Business)**: Nosso cliente (Barbearia, Clínica, etc).
    - **Cliente (Paciente)**: Cliente final do Tenant.
- **Slugs**: Slugs de Business e Professional devem ser validados contra uma lista de palavras reservadas e ser únicos em seu escopo.

## 2. Modularidade Estrita (Gated Features)
- **Check de Módulo**: Nenhuma funcionalidade de Agenda, Cobrança ou NFS-e pode ser executada sem verificar `business.modulos`.
- **Interface**: Se o módulo estiver desativado, a rota correspondente deve retornar **404**, não apenas esconder o botão na UI.
- **Onboarding**: O fluxo de boas-vindas deve ser dinâmico, solicitando apenas os dados necessários para os módulos ativos no plano escolhido.

## 3. Faturamento e API Asaas
- **Resolução de Billing**: Toda lógica de cobrança ou nota deve usar obrigatoriamente a função `resolveBillingConfig(professional, business)`. Nunca assumir o token do Business sem checar o override do Profissional.
- **Segurança de Chaves**: Chaves de API do Asaas (de Tenants ou Profissionais) devem ser criptografadas com **AES-256-GCM** antes de serem salvas no MongoDB.
- **Fidelidade à API**: É proibido inventar campos ou simular comportamentos que não existam na documentação oficial do Asaas.

## 4. Idempotência, Confiabilidade e Testes
- **Webhooks**: Todos os webhooks (Asaas, Plataforma) devem ser idempotentes. O processamento deve verificar se o evento já foi tratado para evitar duplicidade de ações (ex: emitir 2 notas para 1 pagamento).
- **Audit Log**: Toda operação de escrita (Create/Update/Delete) em entidades financeiras ou de agendamento deve gerar um registro em `audit_log`.
- **TDD Obrigatório (lógica crítica)**: Áreas de risco (idempotência, cálculos de slots, transições de assinatura e resolução de billing) exigem testes automatizados **antes** da implementação.

### 4.1 Política de Testes (camadas obrigatórias)

O gate de testes tem **três camadas**; nenhuma cobre a outra. "Verde" só vale se as camadas certas existirem para a superfície tocada:

1. **Integração / API (Jest)** — handlers de rota importados direto + lógica crítica (com TDD nas áreas de risco). É o que já temos.
2. **Componente / Render (Jest + React Testing Library, ambiente `jsdom`)** — **todo componente de UI com lógica** (renderização condicional, estado de formulário, seções reveladas por rádio/checkbox, máscaras, PF/PJ, validação inline) exige teste que **(a)** monte sem lançar e **(b)** exercite os **ramos interativos** (ex.: alternar o rádio que revela o bloco de "faturamento próprio", trocar PF↔PJ). Um componente com render condicional **não** pode ser dado como pronto sem esse teste.
3. **E2E (Cypress)** — contrato público (status/redirect/401) no Preview/Prod. Fluxos autenticados **críticos** ganham E2E quando viável; os demais ficam no gate manual.

- **Regra dura — cobertura da superfície alterada**: testes verdes **não** satisfazem o gate se **não cobrem o que a mudança tocou**. Toda alteração de UI vem acompanhada de teste de render/interação da parte alterada. Um crash de render que passa em verde (ex.: `useFormField should be used within <FormField>`) é **falha de política de testes**, não azar — a resposta correta é **fechar a lacuna de cobertura**, não só corrigir o sintoma.
- **Ao corrigir um bug**: escrever **primeiro** o teste que o reproduz (falha), depois a correção (passa) — teste de regressão obrigatório na camada adequada.

## 5. NFS-e e Dados Fiscais
- **Estratégias de Emissão (Configurável por Tenant)**:
    1. **AUTO_AFTER_PAYMENT**: Emissão automática imediata após o pagamento ser confirmado (`RECEIVED`). Exige dados fiscais completos.
    2. **MANUAL_PER_PAYMENT**: O sistema aguarda o comando do Gestor para cada cobrança paga.
    3. **MANUAL_BATCH**: O Gestor seleciona múltiplas cobranças pagas e dispara a emissão em lote.
- **Responsabilidade e Fallback**: Caso os dados estejam incompletos em qualquer estratégia, a nota fica em `PENDING_CLIENT_DATA`.
- **Pós-Pagamento**: Em nenhuma estratégia a nota automática ou por ação simplificada do gestor deve ser emitida ANTES da confirmação do pagamento.
- **Fluidez**: O preenchimento de dados pelo cliente final é um facilitador. O sistema não deve bloquear a emissão manual se o Gestor possuir os dados e desejar preenchê-los.
- **Retentativas**: Erros na API de NFS-e devem ser registrados e visíveis para o Gestor, permitindo correção e nova tentativa manual.

## 6. Regras Comerciais da Plataforma (Paulo)
- **Assinatura Scalable**: O valor da assinatura do Tenant deve ser recalculado automaticamente sempre que um `professional` for ativado ou desativado (quando o plano prevê cobrança por agenda adicional).
- **Sem Estorno**: Cancelamentos cessam cobranças futuras. Períodos já faturados não são reembolsados (No-Refund Policy).
- **Grace Period**: Respeitar rigorosamente os prazos de TRIAL (30 dias) e GRACE (15 dias) antes da suspensão do acesso ao painel do Tenant.

## 7. Privacidade e Limites Técnicos
- **Dados Sensíveis**: Proibido armazenar dados clínicos, prontuários ou informações de saúde. O sistema é de gestão de agenda e financeira.
- **WhatsApp**: Não utilizar WhatsApp Business API. Todas as comunicações de confirmação devem usar links `wa.me`.
- **E-mails**: Notificações transacionais via Resend devem ser automáticas e registradas em `notification_log`.

## 8. Segurança de Dependências (Tolerância Zero em Produção)
- **Somente releases estáveis (inegociável)**: É **proibido** usar versões `beta`, `preview`, `rc`, `alpha`, `canary` ou qualquer prerelease — tanto em produção quanto em dev. Usar prerelease é considerado **pior que uma vulnerabilidade conhecida**. Sempre a linha **estável** mais recente (dist-tag `latest`), próxima de LTS. Ver a Golden Stack no `README.md`.
- **Gate de Produção (inegociável)**: É proibido fazer push com vulnerabilidades em **dependências de produção** — o gate é `npm audit --omit=dev`, que **deve** reportar zero. É o que efetivamente vai para o bundle/deploy.
- **devDependencies**: Vulnerabilidades exclusivas de ferramentas de desenvolvimento/teste (ex.: cadeia de coverage do Jest), **sem fix sem rebaixar/quebrar** e que **não** vão para produção, são registradas como **débito conhecido** e não bloqueiam o push. Devem ser reavaliadas quando houver patch upstream.
- **Atualização**: Utilizar as versões estáveis e patcheadas mais recentes das dependências críticas (Next.js, React, Mongoose). Nunca "resolver" audit via downgrade (ex.: `npm audit fix --force` que rebaixa `ts-jest`/`jest`).
- **Bloqueio**: O CI local (Husky) valida `npm audit --omit=dev` limpo antes do push.

> **Débito conhecido (2026-06-22)**: ~18 vulns *moderate* em devDependencies de teste, originadas em `@istanbuljs/load-nyc-config` (unmaintained, fixa `js-yaml` 3.x) via `babel-plugin-istanbul`/`babel-jest`. Sem patch disponível; não afetam produção (`npm audit --omit=dev` = 0).
