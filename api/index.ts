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

// IDENTIFICADOR DE VERSÃO - RESET TOTAL
const BUILD_ID = "VERSAO-1.2.0-RESET-TOTAL";

async function startServer() {
  const PORT = 3000;
  
  console.log(`[${BUILD_ID}] Servidor iniciando...`);
  
  try {
    // Tenta inicializar o banco de dados se não estiver na Vercel
    if (!process.env.VERCEL) {
      setupDatabase();
    }
  } catch (err) {
    console.error("Database setup skipped or failed:", err);
  }

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: BUILD_ID, time: new Date().toISOString() });
  });

  // ROTA QUE O MAKE.COM CHAMA (Classify)
  app.post("/api/ai/classify", async (req, res, next) => {
    // Encaminha para a lógica de qualificação
    req.url = "/api/ai/qualify";
    app.handle(req, res, next);
  });

  // Webhook endpoint for WhatsApp messages
  app.post("/api/whatsapp/webhook", (req, res) => {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    try {
      const database = getDb();
      const stmt = database.prepare('INSERT INTO clients (name, phone, status) VALUES (?, ?, ?)');
      const info = stmt.run(name, phone, 'Novo');
      res.status(201).json({ message: "Client created successfully", clientId: info.lastInsertRowid });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.post("/api/webhook/test", async (req, res) => {
    const { webhookUrl } = req.body;
    try {
      const testPayload = {
        event: 'test',
        message: 'Esta é uma mensagem de teste do seu sistema MF-LAR.',
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        res.status(200).json({ success: true, message: 'Webhook de teste enviado com sucesso!' });
      } else {
        const responseText = await response.text();
        res.status(response.status).json({ success: false, message: 'O serviço de webhook retornou um erro.', details: responseText });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, message: 'Erro crítico ao enviar webhook de teste.', details: errorMessage });
    }
  });

  app.post("/api/zapi/test", async (req, res) => {
    const instanceId = process.env.ID_INSTÂNCIA_ZAPI || process.env.ID_INSTANCIA_ZAPI || process.env.ZAPI_INSTANCE_ID || process.env.INSTANCE_ID;
    const token = process.env.TOKEN_ZAPI || process.env.ZAPI_TOKEN || process.env.INSTANCE_TOKEN;
    const clientToken = process.env.TOKEN_DO_CLIENTE_ZAPI || process.env.TOKEN_CLIENTE_ZAPI || process.env.ZAPI_CLIENT_TOKEN || process.env.CLIENT_TOKEN;

    if (!instanceId || !token || !clientToken) {
      return res.status(500).json({
        success: false,
        message: 'Credenciais incompletas na Vercel.',
        details: `Detectado: ID=${instanceId?.substring(0,4)}..., Token=${token?.substring(0,4)}..., Client=${clientToken?.substring(0,4)}...`
      });
    }

    try {
      const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/status`;
      const zapiResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'client-token': clientToken
        }
      });

      const responseText = await zapiResponse.text();
      
      try {
        const data = JSON.parse(responseText);
        if (zapiResponse.ok) {
          res.status(200).json({ success: true, message: "Conexão com a Z-API verificada!", zapiData: data });
        } else {
          res.status(zapiResponse.status).json({ success: false, message: `Z-API erro: ${zapiResponse.statusText}`, details: responseText });
        }
      } catch (e) {
        res.status(zapiResponse.status).json({ 
          success: false, 
          message: 'A Z-API respondeu com um formato inválido (HTML). Verifique se o ID da Instância e o Token estão corretos.',
          details: responseText.substring(0, 100) 
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, message: 'Erro interno ao tentar se comunicar com a Z-API.', details: errorMessage });
    }
  });

  app.get("/api/clients", (req, res) => {
    try {
      const database = getDb();
      const stmt = database.prepare('SELECT * FROM clients ORDER BY created_at DESC');
      const clients = stmt.all();
      res.status(200).json(clients);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, message: 'Falha ao buscar clientes.', details: errorMessage });
    }
  });

  async function extractNumber(message: string, description: string): Promise<number> {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = 'gemini-3-flash-preview';
    const prompt = `Extraia apenas o valor numérico da seguinte frase que se refere a ${description}: "${message}". Responda apenas com o número, sem pontos, vírgulas ou símbolos de moeda. Se nenhum número for encontrado, responda com '0'.`;
    try {
      const response = await ai.models.generateContent({ model, contents: prompt });
      const numericString = response.text.trim().replace(/\D/g, '');
      return parseInt(numericString, 10) || 0;
    } catch (error) {
      return 0;
    }
  }

  async function sendZapiMessage(phone: string, message: string) {
    const instanceId = process.env.ZAPI_INSTANCE_ID || process.env.ID_INSTANCIA_ZAPI || process.env.ID_INSTÂNCIA_ZAPI || process.env.INSTANCE_ID;
    const token = process.env.ZAPI_TOKEN || process.env.TOKEN_ZAPI || process.env.INSTANCE_TOKEN;
    const clientToken = process.env.ZAPI_CLIENT_TOKEN || process.env.TOKEN_DO_CLIENTE_ZAPI || process.env.TOKEN_CLIENTE_ZAPI || process.env.CLIENT_TOKEN;

    if (!instanceId || !token || !clientToken) return;

    try {
      await fetch(`https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client-token': clientToken
        },
        body: JSON.stringify({ phone, message })
      });
    } catch (error) {
      console.error(`Critical error sending Z-API message to ${phone}:`, error);
    }
  }

  app.post("/api/ai/qualify", async (req, res) => {
    const { phone, message, isSimulation } = req.body;
    if (!phone || !message) return res.status(400).json({ error: "Telefone e mensagem são obrigatórios." });

    try {
      const database = getDb();
      let client = database.prepare('SELECT * FROM clients WHERE phone = ?').get(phone);
      if (!client) {
        database.prepare('INSERT INTO clients (phone) VALUES (?)').run(phone);
        client = database.prepare('SELECT * FROM clients WHERE phone = ?').get(phone);
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = 'gemini-3-flash-preview';
      let responseMessage = '';

      const isOffTopicPrompt = `O usuário deveria responder à pergunta sobre ${client.qualification_step}. A resposta dele foi: "${message}". Esta resposta é relevante para a pergunta ou o usuário está tentando desviar do assunto? Responda apenas 'sim' ou 'não'.`;
      const offTopicResponse = await ai.models.generateContent({ model, contents: isOffTopicPrompt });
      const isOffTopic = offTopicResponse.text.trim().toLowerCase();

      if (isOffTopic === 'não' && client.qualification_step !== 'ask_user_type') {
        return res.json({ reply: 'Para garantir que possamos te ajudar da melhor forma, por favor, siga o roteiro de perguntas.' });
      }

      switch (client.qualification_step) {
        case 'ask_user_type':
          const userTypePrompt = `A mensagem a seguir indica que o usuário é um "Corretor de Imóveis" ou um "Cliente Final (Pessoa Física)"? Responda apenas 'corretor' ou 'pessoa_fisica'. Mensagem: "${message}"`;
          const userTypeResponse = await ai.models.generateContent({ model, contents: userTypePrompt });
          const userType = userTypeResponse.text.trim();
          if (userType === 'corretor') {
            database.prepare('UPDATE clients SET user_type = ?, qualification_step = ?, status = ? WHERE phone = ?').run('corretor', 'completed', 'broker', phone);
            responseMessage = 'Entendido. No momento, nosso sistema está focado no atendimento a Pessoas Físicas.';
          } else {
            database.prepare('UPDATE clients SET user_type = ?, qualification_step = ? WHERE phone = ?').run('pessoa_fisica', 'ask_name', phone);
            responseMessage = 'Qual é o nome completo do interessado no financiamento?';
          }
          break;
        case 'ask_name':
          database.prepare('UPDATE clients SET name = ?, qualification_step = ? WHERE phone = ?').run(message, 'ask_document', phone);
          responseMessage = 'Poderia informar o CPF do comprador? (Apenas números).';
          break;
        case 'ask_document':
          database.prepare('UPDATE clients SET document = ?, qualification_step = ? WHERE phone = ?').run(message.replace(/\D/g, ''), 'ask_email', phone);
          responseMessage = 'Qual o seu principal endereço de e-mail?';
          break;
        case 'ask_email':
          database.prepare('UPDATE clients SET email = ?, qualification_step = ? WHERE phone = ?').run(message, 'ask_estimated_value', phone);
          responseMessage = 'Qual o valor aproximado do imóvel que você pretende comprar?';
          break;
        case 'ask_estimated_value':
          const estimatedValue = await extractNumber(message, 'valor do imóvel');
          database.prepare('UPDATE clients SET estimated_value = ?, qualification_step = ? WHERE phone = ?').run(estimatedValue, 'ask_income', phone);
          responseMessage = 'Para finalizar a triagem, qual a sua renda mensal bruta?';
          break;
        case 'ask_income':
          const income = await extractNumber(message, 'renda mensal');
          const updatedClient = database.prepare('SELECT name FROM clients WHERE phone = ?').get(phone);
          database.prepare('UPDATE clients SET income = ?, qualification_step = ?, status = ? WHERE phone = ?').run(income, 'completed', 'qualified', phone);
          responseMessage = `✅ Cadastro Realizado com Sucesso!\n\nOlá, ${updatedClient.name}, recebemos suas informações.`;
          break;
        case 'completed':
          responseMessage = 'Já concluímos sua pré-qualificação. Em breve um de nossos consultores entrará em contato.';
          break;
      }

      if (isSimulation && responseMessage) {
        await sendZapiMessage(phone, responseMessage);
      }
      res.json({ reply: responseMessage });
    } catch (error) {
      res.status(500).json({ error: "Falha ao processar a qualificação com a IA." });
    }
  });

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();
export default app;
