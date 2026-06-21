import dbConnect from "../src/lib/mongodb";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

// Carrega o .env.test.local
dotenv.config({ path: path.resolve(__dirname, "../.env.test.local") });

beforeAll(async () => {
  await dbConnect();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
