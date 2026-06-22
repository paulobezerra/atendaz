import mongoose, { Schema, Document } from "mongoose";

export interface ISegmento extends Document {
  slug: string;
  nome: string;
  ativo: boolean;
  ordem: number;
  createdAt: Date;
  updatedAt: Date;
}

const SegmentoSchema = new Schema<ISegmento>(
  {
    slug: { type: String, required: true, unique: true },
    nome: { type: String, required: true },
    ativo: { type: Boolean, default: true },
    ordem: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default (mongoose.models.Segmento as mongoose.Model<ISegmento>) ||
  mongoose.model<ISegmento>("Segmento", SegmentoSchema);
