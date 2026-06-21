# Visão do Produto

Plataforma modular de Agenda + Cobrança + NFS-e (multi-nicho, multi-agenda).

## Módulos
- **Agenda**: Autoagendamento e gestão de horários.
- **Cobrança**: Pix/boleto recorrente e avulso via Asaas.
- **NFS-e**: Emissão de nota fiscal automática ou manual.

Cada `business` escolhe um plano no onboarding, que define quais módulos estão habilitados.

## Casos de Uso e Combinações Reais
- **Barbearia Simples**: Apenas agenda, cobra na maquininha (`agenda: true, cobranca: false, nfse: false`).
- **Clínica Mista**: Profissionais CLT (faturam pelo CNPJ da clínica) e PJ (faturam por conta própria). `cobranca: true`, cada profissional decide se herda ou faz override do billing.
- **Emissor de Notas**: Apenas emissão de nota para quem recebe por fora (`agenda: false, cobranca: false, nfse: true`).
- **Solução Completa**: Todos os módulos ligados, preço escala pela quantidade de agendas.

## Objetivo Arquitetural
Permitir diferentes modelos de negócio usando o mesmo modelo de dados, com três capacidades independentes que podem ser ligadas ou desligadas conforme a necessidade do cliente.
