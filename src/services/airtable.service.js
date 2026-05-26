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
  let todosRegistros = [];
  let offset;
  const filterByFormula = "AND(Status!='Entregue', Codigo!='')";

  do {
    const response = await airtableApi.get("", {
      params: {
        filterByFormula,
        offset,
      },
    });

    const registros = response.data.records || [];
    todosRegistros = todosRegistros.concat(registros);
    offset = response.data.offset;
  } while (offset);

  return todosRegistros;
}

export async function atualizarEmLote(registros) {
  if (!Array.isArray(registros) || registros.length === 0) return;

  const vistos = new Map();
  for (const registro of registros) {
    vistos.set(registro.id, registro);
  }
  const unicos = [...vistos.values()];

  const chunks = [];
  for (let i = 0; i < unicos.length; i += 10) {
    chunks.push(unicos.slice(i, i + 10));
  }

  for (const chunk of chunks) {
    await airtableApi.patch("", { records: chunk });
  }
}

