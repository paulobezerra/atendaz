import mongoose, { Schema, Document } from "mongoose";

export interface IPlano extends Document {
  slug: string;
  nome: string;
  modulos: {
    agenda: boolean;
    agendaPublica: boolean;
    cobranca: boolean;
    nfse: boolean;
  };
  precoBase: number;
  precoPorAgendaAdicional: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlanoSchema: Schema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    nome: { type: String, required: true },
    modulos: {
      agenda: { type: Boolean, default: false },
      agendaPublica: { type: Boolean, default: false },
      cobranca: { type: Boolean, default: false },
      nfse: { type: Boolean, default: false },
    },
    precoBase: { type: Number, required: true },
    precoPorAgendaAdicional: { type: Number, required: true },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Plano || mongoose.model<IPlano>("Plano", PlanoSchema);
