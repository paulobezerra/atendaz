import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  entidade: string;
  entidadeId: string;
  acao: string;
  /** Resumo sem dados sensíveis (NUNCA chave Asaas em texto plano). */
  payloadResumido?: Record<string, unknown>;
  businessId?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  entidade: { type: String, required: true, index: true },
  entidadeId: { type: String, required: true, index: true },
  acao: { type: String, required: true },
  payloadResumido: { type: Schema.Types.Mixed },
  businessId: { type: String, index: true },
  timestamp: { type: Date, default: Date.now },
});

const AuditLog =
  (mongoose.models.AuditLog as mongoose.Model<IAuditLog>) ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

/**
 * Registra uma escrita relevante em `audit_log` (Guardrail 4).
 * Best-effort: falha de auditoria nunca derruba a operação de negócio.
 */
export async function logAudit(entry: {
  entidade: string;
  entidadeId: string;
  acao: string;
  businessId?: string;
  payloadResumido?: Record<string, unknown>;
}): Promise<void> {
  try {
    await AuditLog.create({ ...entry, timestamp: new Date() });
  } catch (e) {
    console.error("audit_log falhou:", e);
  }
}

export default AuditLog;
