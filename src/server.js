import express from "express";
import cron from "node-cron";
import config from "./config/env.js";
import rastreioController from "./controllers/rastreio.controller.js";
import { executarSincronizacao } from "./services/sincronizacao.service.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "rastreamento-api",
    timestamp: new Date().toISOString(),
  });
});

app.post("/atualizar-rastreios", rastreioController);

app.listen(config.port, () => {
  console.log(`Servidor rodando na porta ${config.port}`);
});

async function rodarSincronizacao() {
  try {
    await executarSincronizacao();
  } catch (err) {
    console.error("[Sincronizacao] Erro no ciclo:", err.message);
  }
}

// Segunda a sábado às 12:00 e às 18:00
cron.schedule("0 12 * * 1-6", rodarSincronizacao);
cron.schedule("0 18 * * 1-6", rodarSincronizacao);

console.log("[Sincronizacao] Agendamento ativo: 12:00 e 18:00 (seg-sab)");