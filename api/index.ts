import express from "express";
import cors from "cors";
import { getDb, setupDatabase } from "../src/services/database.js";
import path from "path";
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

const BUILD_ID = "VERSAO-1.2.0-RESET-TOTAL";

async function startServer() {
  const PORT = 3000;
  try {
    if (!process.env.VERCEL) {
      setupDatabase();
    }
  } catch (err) {
    console.error("Database setup failed:", err);
  }

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: BUILD_ID, time: new Date().toISOString() });
  });

  app.post("/api/ai/classify", async (req, res, next) => {
    req.url = "/api/ai/qualify";
    app.handle(req, res, next);
  });

  app.get("/api/clients", (req, res) => {
    try {
      const database = getDb();
      const clients = database.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
      res.status(200).json(clients);
    } catch (error) {
      res.status(500).json({ success: false });
    }
  });

  app.post("/api/ai/qualify", async (req, res) => {
    res.json({ reply: "Sistema atualizado com sucesso! Versão 1.2.0 ativa." });
  });

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
  }
}

startServer();
export default app;
