import axios from "axios";
import config from "../config/env.js";

const airtableApi = axios.create({
  baseURL: `https://api.airtable.com/v0/${config.airtableBaseId}/${encodeURIComponent(config.airtableTable)}`,
  headers: {
    Authorization: `Bearer ${config.airtableApiKey}`,
    "Content-Type": "application/json",
  },
  timeout: config.requestTimeoutMs,
});

export async function buscarPendentes() {
  const response = await airtableApi.get("", {
    params: {
      filterByFormula: "AND(Status!='Entregue', Codigo!='')",
    },
  });

  return response.data.records || [];
}

export async function atualizarEmLote(registros) {
  if (!Array.isArray(registros) || registros.length === 0) return;

  const chunks = [];
  for (let i = 0; i < registros.length; i += 10) {
    chunks.push(registros.slice(i, i + 10));
  }

  for (const chunk of chunks) {
    await airtableApi.patch("", { records: chunk });
  }
}