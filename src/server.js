import express from "express";
import config from "./config/env.js";
import rastreioController from "./controllers/rastreio.controller.js";

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