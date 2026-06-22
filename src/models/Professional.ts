import mongoose, { Schema, Document, Types } from "mongoose";
import type { IBillingConfig } from "./Business";

export interface IProfessional extends Document {
  businessId: Types.ObjectId;
  nome: string;
  slugInterno: string;
  whatsapp?: string;
  bio?: string;
  fotoUrl?: string;
  /** Override de billing; null = herda do business. */
  billingConfig?: (IBillingConfig & { cpfCnpj?: string }) | null;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProfessionalSchema = new Schema<IProfessional>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    nome: { type: String, required: true },
    slugInterno: { type: String, required: true },
    whatsapp: { type: String },
    bio: { type: String },
    fotoUrl: { type: String },
    billingConfig: { type: Schema.Types.Mixed, default: null },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// slugInterno único no escopo do business
ProfessionalSchema.index({ businessId: 1, slugInterno: 1 }, { unique: true });

export default (mongoose.models.Professional as mongoose.Model<IProfessional>) ||
  mongoose.model<IProfessional>("Professional", ProfessionalSchema);
