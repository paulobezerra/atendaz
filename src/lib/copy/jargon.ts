/**
 * Copy centralizada de jargão (docs/10 — "Tooltips para jargão"). O usuário é
 * especialista no negócio dele, não no nosso vocabulário. Reusada em todas as telas.
 */
export const JARGON = {
  segmento:
    "A área de atuação do seu negócio (ex.: barbearia, clínica, estética). Usamos para personalizar sua experiência.",
  slug: "É o endereço público onde seus clientes agendam: atendaz.com/agendar/seu-endereco. Use algo curto e fácil de lembrar.",
  meioPagamento:
    "A cobrança (Pix, cartão, boleto) e a emissão de NFS-e são feitas através do Asaas, nosso parceiro de pagamentos. O token é a Chave de API da conta Asaas do profissional — encontre em Configurações › Integrações › Chaves de API, dentro do painel do Asaas.",
  nfse: "Nota Fiscal de Serviço eletrônica (NFS-e), emitida pela prefeitura. Pode ser automática após o pagamento.",
  nfseStrategy:
    "Quando a nota é emitida: automática após o pagamento, manual por cobrança, ou manual em lote.",
} as const;

export type JargonKey = keyof typeof JARGON;
