import mongoose, { Schema, Document, Types } from "mongoose";

export type NfseStrategy =
  | "AUTO_AFTER_PAYMENT"
  | "MANUAL_PER_PAYMENT"
  | "MANUAL_BATCH";

export interface ICodigosFiscais {
  municipalServiceCode?: string;
  nbsCode?: string;
  taxSituationCode?: string;
  taxClassificationCode?: string;
  operationIndicatorCode?: string;
}

export interface IBillingConfig {
  asaasApiKeyEncrypted?: string;
  nfseStrategy?: NfseStrategy;
  codigosFiscais?: ICodigosFiscais;
}

export interface IModulos {
  agenda: boolean;
  agendaPublica: boolean;
  cobranca: boolean;
  nfse: boolean;
}

export interface IBusiness extends Document {
  googleId: string;
  nomeFantasia: string;
  slug: string;
  email: string;
  segmento?: string;
  planoId?: Types.ObjectId | null;
  modulos: IModulos;
  cpfCnpj?: string | null;
  billingConfigPadrao?: IBillingConfig | null;
  onboardingStatus: "PENDING" | "COMPLETE";
  createdAt: Date;
  updatedAt: Date;
}

const CodigosFiscaisSchema = new Schema<ICodigosFiscais>(
  {
    municipalServiceCode: String,
    nbsCode: String,
    taxSituationCode: String,
    taxClassificationCode: String,
    operationIndicatorCode: String,
  },
  { _id: false }
);

const BillingConfigSchema = new Schema<IBillingConfig>(
  {
    asaasApiKeyEncrypted: String,
    nfseStrategy: {
      type: String,
      enum: ["AUTO_AFTER_PAYMENT", "MANUAL_PER_PAYMENT", "MANUAL_BATCH"],
    },
    codigosFiscais: CodigosFiscaisSchema,
  },
  { _id: false }
);

const BusinessSchema = new Schema<IBusiness>(
  {
    googleId: { type: String, required: true, unique: true },
    nomeFantasia: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    segmento: { type: String },
    planoId: {
      type: Schema.Types.ObjectId,
      ref: "Plano",
      required: false,
      default: null,
    },
    modulos: {
      agenda: { type: Boolean, default: false },
      agendaPublica: { type: Boolean, default: false },
      cobranca: { type: Boolean, default: false },
      nfse: { type: Boolean, default: false },
    },
    cpfCnpj: { type: String, default: null },
    billingConfigPadrao: { type: BillingConfigSchema, default: null },
    onboardingStatus: {
      type: String,
      enum: ["PENDING", "COMPLETE"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export default (mongoose.models.Business as mongoose.Model<IBusiness>) ||
  mongoose.model<IBusiness>("Business", BusinessSchema);
