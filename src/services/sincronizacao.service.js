import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { buscarPostagensNovas } from "./mysql.service.js";
import { buscarCodigosExistentes, criarRegistros } from "./airtable.service.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(__dirname, "../data/sync_state.json");

async function lerUltimoCreatedAt() {
  try {
    const conteudo = await readFile(STATE_FILE, "utf8");
    const estado = JSON.parse(conteudo);
    return new Date(estado.lastCreatedAt);
  } catch {
    // Arquivo não existe ainda: usa data/hora atual como ponto de partida
    return new Date();
  }
}

async function gravarUltimoCreatedAt(data) {
  await mkdir(join(__dirname, "../data"), { recursive: true });
  await writeFile(
    STATE_FILE,
    JSON.stringify({ lastCreatedAt: data.toISOString() }, null, 2),
    "utf8"
  );
}

function formatarDataParaAirtable(valor) {
  const d = valor instanceof Date ? valor : new Date(valor);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function executarSincronizacao() {
  console.log(`[Sincronizacao] Iniciando ciclo em ${new Date().toISOString()}`);

  const lastCreatedAt = await lerUltimoCreatedAt();
  console.log(`[Sincronizacao] Buscando postagens com created_at > ${lastCreatedAt.toISOString()}`);

  const postagens = await buscarPostagensNovas(lastCreatedAt);
  console.log(`[Sincronizacao] ${postagens.length} postagem(ns) encontrada(s) no MySQL`);

  if (postagens.length === 0) {
    console.log("[Sincronizacao] Nenhum registro novo. Ciclo encerrado.");
    return;
  }

  const codigosExistentes = await buscarCodigosExistentes();
  console.log(`[Sincronizacao] ${codigosExistentes.size} codigo(s) ja existente(s) no Airtable`);

  const novosRegistros = postagens
    .filter((p) => !codigosExistentes.has(p.numero_etiqueta))
    .map((p) => ({
      fields: {
        Canal: p.canal_venda,
        "Numero Pedido": p.numero_pedido_externo,
        Codigo: p.numero_etiqueta,
        "Data Postagem": formatarDataParaAirtable(p.created_at),
      },
    }));

  console.log(`[Sincronizacao] ${novosRegistros.length} registro(s) novo(s) para criar no Airtable`);

  if (novosRegistros.length > 0) {
    await criarRegistros(novosRegistros);
    console.log("[Sincronizacao] Registros criados no Airtable com sucesso.");
  }

  const maxCreatedAt = postagens.reduce((max, p) => {
    const d = p.created_at instanceof Date ? p.created_at : new Date(p.created_at);
    return d > max ? d : max;
  }, new Date(0));

  await gravarUltimoCreatedAt(maxCreatedAt);
  console.log(`[Sincronizacao] Ultimo created_at gravado: ${maxCreatedAt.toISOString()}`);
  console.log("[Sincronizacao] Ciclo encerrado com sucesso.");
}
