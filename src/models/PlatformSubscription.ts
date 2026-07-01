import mongoose, { Schema, Document, Types } from "mongoose";

export type PlatformSubscriptionStatus =
  | "TRIAL"
  | "GRACE"
  | "ACTIVE"
  | "CANCELED";

export interface IPlatformSubscription extends Document {
  businessId: Types.ObjectId;
  planoId?: Types.ObjectId | null;
  status: PlatformSubscriptionStatus;
  trialEndsAt?: Date;
  graceEndsAt?: Date;
  qtdAgendasAtivas: number;
  valorMensal?: number;
  asaasSubscriptionId?: string;
  asaasPaymentIdAtual?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformSubscriptionSchema = new Schema<IPlatformSubscription>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      unique: true,
    },
    planoId: {
      type: Schema.Types.ObjectId,
      ref: "Plano",
      required: false,
      default: null,
    },
    status: {
      type: String,
      enum: ["TRIAL", "GRACE", "ACTIVE", "CANCELED"],
      default: "TRIAL",
    },
    trialEndsAt: { type: Date },
    graceEndsAt: { type: Date },
    qtdAgendasAtivas: { type: Number, default: 1 },
    valorMensal: { type: Number },
    asaasSubscriptionId: { type: String },
    asaasPaymentIdAtual: { type: String },
  },
  { timestamps: true }
);

export default (mongoose.models
  .PlatformSubscription as mongoose.Model<IPlatformSubscription>) ||
  mongoose.model<IPlatformSubscription>(
    "PlatformSubscription",
    PlatformSubscriptionSchema
  );
