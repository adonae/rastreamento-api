import pLimit from "p-limit";
import config from "../config/env.js";
import { gerarToken, limparCacheToken } from "../services/token.service.js";
import { consultarRastreio } from "../services/correios.service.js";
import { buscarPendentes, atualizarEmLote } from "../services/airtable.service.js";
import { mapearStatus } from "../utils/statusMapper.js";

export default async function rastreioController(req, res) {
  if (req.headers["x-secret"] !== config.cronSecret) {
    return res.status(401).json({ erro: "Não autorizado" });
  }

  const inicioExecucao = Date.now();

  try {
    console.log("1. Gerando token dos Correios...");
    const token = await gerarToken();

    console.log("2. Buscando registros no Airtable...");
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

    const limit = pLimit(config.correiosConcurrency);
    let totalFalhas = 0;

    const resultados = await Promise.all(
      registros.map((registro) =>
        limit(async () => {
          try {
            const codigo = registro.fields?.Codigo;
            if (!codigo) return null;

            const dados = await consultarRastreio(codigo, token);
            const ultimoEvento = dados?.objetos?.[0]?.eventos?.[0];

            if (!ultimoEvento) {
              console.warn(`Sem eventos para o código ${codigo}`);
              return null;
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

            return {
              id: registro.id,
              fields,
            };
          } catch (error) {
            totalFalhas += 1;

            const codigo = registro.fields?.Codigo || "sem código";
            const detalhes = error.response?.data || error.message;

            console.error(`Erro ao processar ${codigo}:`, detalhes);

            if (error.response?.status === 401) {
              limparCacheToken();
            }

            return null;
          }
        }),
      ),
    );

    const atualizacoes = resultados.filter(Boolean);

    await atualizarEmLote(atualizacoes);

    const duracaoMs = Date.now() - inicioExecucao;

    console.log(
      JSON.stringify({
        evento: "atualizacao_rastreios_finalizada",
        totalEncontrados: registros.length,
        totalAtualizados: atualizacoes.length,
        totalFalhas,
        duracaoMs,
      }),
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: "Rastreios processados com sucesso",
      totalEncontrados: registros.length,
      totalAtualizados: atualizacoes.length,
      totalFalhas,
      concorrencia: config.correiosConcurrency,
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