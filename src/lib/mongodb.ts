import mongoose from "mongoose";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  // Só reusa a conexão em cache se ela estiver realmente PRONTA (readyState 1).
  // Em serverless, o socket do Atlas pode cair por idle e o mongoose ficar
  // reconectando (readyState 2) — devolver a conexão "crua" aqui gerava
  // falso negativo no /api/health.
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Reconectando: aguarda ficar pronto em vez de devolver conexão não-pronta.
  if (cached.conn && mongoose.connection.readyState === 2) {
    await new Promise<void>((resolve, reject) => {
      mongoose.connection.once("connected", () => resolve());
      mongoose.connection.once("error", (err) => reject(err));
    });
    return cached.conn;
  }

  // Desconectado/sem cache: (re)inicia a conexão.
  if (mongoose.connection.readyState === 0) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("🔥 MongoDB Connected Successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB Connection Error:", e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
