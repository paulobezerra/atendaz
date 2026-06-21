import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Sobrescreve a env para o Singleton usar o banco em memória
  process.env.MONGODB_URI = uri;
  
  // O dbConnect do src/lib/mongodb.ts será chamado pelos testes/rotas
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Limpa as coleções entre os testes para garantir isolamento
afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});
