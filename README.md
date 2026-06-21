# Atendaz - Plataforma Modular de Agenda + Cobrança + NFS-e

Sistema modular para gestão de agendamentos, cobranças automatizadas via Asaas e emissão de notas fiscais (NFS-e).

## 🚀 Fluxo de Trabalho (Agent-First)

Este projeto utiliza um fluxo de trabalho rigoroso onde a **documentação é a fonte da verdade**. Qualquer agente (Junie, Claude, Gemini) deve seguir os passos abaixo:

### 1. Documentação (Spec)
Toda funcionalidade deve estar descrita em `docs/spec/F{ID}-{nome}.md`. O roadmap oficial está em `docs/06-implementation-roadmap.md`.

### 2. Planejamento (`/plan {ID}`)
Antes de codar, o agente deve gerar um plano técnico.
- **Comando**: `/plan {ID}` (ex: `/plan 0`)
- **Ação**: O agente deve ler **toda a documentação em `docs/`** para contexto total e criar um checklist detalhado em `docs/plans/{ID}-{nome}.md`.
- **Revisão**: O usuário valida o plano antes da execução.

### 3. Implementação (`/code {ID}`)
Após o plano ser aprovado, inicia-se a codificação.
- **Comando**: `/code {ID}` (ex: `/code 0`)
- **Ação**: O agente relê a spec, o plano e os **Guardrails (`docs/07`)**, implementando a feature com fidelidade total à documentação.

## 🛠 Comandos Rápidos

| Comando | Descrição |
| :--- | :--- |
| `/plan {ID}` | Gera o plano técnico de execução em `docs/plans/` |
| `/code {ID}` | Inicia a implementação da feature baseada na spec e plano |
| `/doc {tema}` | Atualiza documentação, modelos ou decisões arquiteturais |
| `/test {env}` | Executa testes automatizados (local ou prod) |
| `/done {ID}` | Finaliza a feature (Ação do Usuário) |

## 📖 Documentação Importante
- [Instruções para Agentes](docs/00-agent-instructions.md)
- [Roadmap de Implementação](docs/06-implementation-roadmap.md)
- [Modelo de Dados](docs/04-data-model.md)
- [Requisitos Técnicos](docs/03-technical-requirements.md)

## 💎 Golden Stack (Referência de Estabilidade)
Para evitar loops de dependências, utilize sempre:
- **Node.js**: 20 (LTS)
- **Next.js**: 15.1.4+ (Sem vulnerabilidades)
- **React**: 19.0.0
- **Mongoose**: 8.9.0+
- **Tailwind**: 3.4+

## ⚡ Fluxo Acelerado (Vapt-Vupt)
1. **DOR**: `/plan {ID}` -> Auditoria automática de segurança + Check de Envs.
2. **Warm-up**: No início do `/code`, o agente limpa caches e garante a Golden Stack.
3. **Execução**: Implementação TDD + `/test local`.
4. **DOD**: `/test prod` -> Build limpo na Vercel + Sucesso em produção.

---
*Nota: Não é necessário prefixar com @nome-do-agente se você já estiver em um chat direto com ele. Apenas o comando `/plan` ou `/code` é suficiente.*
