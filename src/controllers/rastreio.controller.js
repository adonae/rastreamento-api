import config from "../config/env.js";
import { gerarToken } from "../services/token.service.js";
import { consultarRastreiosEmLote } from "../services/correios.service.js";
import { buscarPendentes, atualizarEmLote } from "../services/airtable.service.js";
import { mapearStatus } from "../utils/statusMapper.js";

function dividirEmLotes(lista, tamanho) {
  const lotes = [];

  for (let i = 0; i < lista.length; i += tamanho) {
    lotes.push(lista.slice(i, i + tamanho));
  }

  return lotes;
}

export default async function rastreioController(req, res) {
  if (req.headers["x-secret"] !== config.cronSecret) {
    return res.status(401).json({ erro: "Não autorizado" });
  }

  const inicioExecucao = Date.now();

  try {
    console.log("1. Gerando token dos Correios...");
    const token = await gerarToken();

    console.log("2. Buscando registros pendentes no Airtable...");
    const registros = await buscarPendentes();

    if (!registros.length) {
      return res.status(200).json({
        sucesso: true,
        mensagem: "Nenhum rastreio pendente encontrado",
        totalEncontrados: 0,
        totalAtualizados: 0,
        totalFalhas: 0,
        duracaoMs: Date.now() - inicioExecucao,
      });
    }

    const registrosValidos = registros.filter((registro) => registro.fields?.Codigo);
    const codigos = registrosValidos.map((registro) => registro.fields.Codigo);

    const mapaRegistros = new Map(
      registrosValidos.map((registro) => [registro.fields.Codigo, registro]),
    );

    const TAMANHO_LOTE = 50;
    const lotes = dividirEmLotes(codigos, TAMANHO_LOTE);

    let totalFalhas = 0;
    const atualizacoes = [];

    console.log(`3. Consultando ${codigos.length} rastreios em ${lotes.length} lote(s)...`);

    for (const lote of lotes) {
      try {
        const objetos = await consultarRastreiosEmLote(lote, token);

        for (const objeto of objetos) {
          const codigo = objeto.codObjeto;
          const registro = mapaRegistros.get(codigo);

          if (!registro) continue;

          const ultimoEvento = objeto?.eventos?.[0];
          if (!ultimoEvento) {
            console.warn(`Sem eventos para o código ${codigo}`);
            continue;
          }

          const novoStatus = mapearStatus(ultimoEvento);

          const fields = {
            Status: novoStatus,
            "Último Evento": ultimoEvento.descricao || "",
            "Última Atualização": new Date().toISOString(),
          };

          if (novoStatus === "Entregue") {
            fields["Data Entrega"] =
              ultimoEvento.dtHrCriado || new Date().toISOString();
          }

          atualizacoes.push({
            id: registro.id,
            fields,
          });
        }
      } catch (error) {
        totalFalhas += lote.length;
        console.error("Erro ao consultar lote:", lote);
        console.error(error.response?.data || error.message);
      }
    }

    await atualizarEmLote(atualizacoes);

    const duracaoMs = Date.now() - inicioExecucao;

    console.log(
      JSON.stringify({
        evento: "atualizacao_rastreios_finalizada",
        totalEncontrados: registros.length,
        totalAtualizados: atualizacoes.length,
        totalFalhas,
        totalLotes: lotes.length,
        tamanhoLote: TAMANHO_LOTE,
        duracaoMs,
      }),
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: "Rastreios processados com sucesso",
      totalEncontrados: registros.length,
      totalAtualizados: atualizacoes.length,
      totalFalhas,
      totalLotes: lotes.length,
      tamanhoLote: TAMANHO_LOTE,
      duracaoMs,
    });
  } catch (error) {
    console.error("Erro geral na atualização:");
    console.error("Status:", error.response?.status);
    console.error("URL:", error.config?.url);
    console.error("Método:", error.config?.method);
    console.error("Resposta:", error.response?.data || error.message);

    return res.status(500).json({
      erro: "Erro na atualização dos rastreios",
      detalhes: error.response?.data || error.message,
      status: error.response?.status || null,
      url: error.config?.url || null,
      duracaoMs: Date.now() - inicioExecucao,
    });
  }
}