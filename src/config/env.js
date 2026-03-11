import "dotenv/config";

export default {
  port: Number(process.env.PORT || 3000),

  correiosBaseUrl: process.env.CORREIOS_BASE_URL,
  usuarioMeusCorreios: process.env.USUARIO_MEUS_CORREIOS,
  wsNovaApi: process.env.WS_NOVA_API,
  contratoCorreios: process.env.CONTRATO_CORREIOS,
  correiosDr: Number(process.env.CORREIOS_DR || 30),

  airtableApiKey: process.env.AIRTABLE_API_KEY,
  airtableBaseId: process.env.AIRTABLE_BASE_ID,
  airtableTable: process.env.AIRTABLE_TABLE,

  cronSecret: process.env.CRON_SECRET,

  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 20000),
  correiosConcurrency: Number(process.env.CORREIOS_CONCURRENCY || 10),
  tokenExpirySafetyMs: Number(process.env.TOKEN_EXPIRY_SAFETY_MS || 60000),
};