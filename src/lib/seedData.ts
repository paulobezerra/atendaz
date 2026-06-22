// Dados de referência (fonte única para o seed manual e o ensureSeed automático).

export interface PlanoSeed {
  slug: string;
  nome: string;
  modulos: { agenda: boolean; agendaPublica: boolean; cobranca: boolean; nfse: boolean };
  precoBase: number;
  precoPorAgendaAdicional: number;
  ativo: boolean;
}

export const PLANOS: PlanoSeed[] = [
  {
    slug: "agenda-simples",
    nome: "Agenda Simples",
    modulos: { agenda: true, agendaPublica: true, cobranca: false, nfse: false },
    precoBase: 29,
    precoPorAgendaAdicional: 15,
    ativo: true,
  },
  {
    slug: "cobranca-nota",
    nome: "Cobrança + Nota",
    modulos: { agenda: false, agendaPublica: false, cobranca: true, nfse: true },
    precoBase: 39,
    precoPorAgendaAdicional: 0,
    ativo: true,
  },
  {
    slug: "completo",
    nome: "Completo",
    modulos: { agenda: true, agendaPublica: true, cobranca: true, nfse: true },
    precoBase: 59,
    precoPorAgendaAdicional: 25,
    ativo: true,
  },
];

// Lista controlada de segmentos do ramo de serviços (expansível).
export const SEGMENTOS_NOMES: string[] = [
  "Barbearia", "Salão de Beleza", "Estética", "Manicure e Pedicure",
  "Maquiagem", "Sobrancelhas e Cílios", "Depilação", "Tatuagem e Piercing",
  "Clínica Médica", "Odontologia", "Fisioterapia", "Psicologia",
  "Nutrição", "Fonoaudiologia", "Terapias Holísticas", "Personal Trainer",
  "Pilates", "Academia", "Yoga", "Petshop", "Veterinária", "Banho e Tosa",
  "Advocacia", "Contabilidade", "Consultoria", "Coaching", "Arquitetura",
  "Design", "Fotografia", "Marketing Digital", "Aulas Particulares",
  "Idiomas", "Música", "Reformas e Reparos", "Limpeza", "Eventos",
  "Mecânica Automotiva", "Outros",
];
