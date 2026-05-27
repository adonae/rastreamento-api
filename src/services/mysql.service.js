import mysql from "mysql2/promise";
import config from "../config/env.js";

export async function buscarPostagensNovas(lastCreatedAt) {
  const conn = await mysql.createConnection({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPass,
    database: config.dbName,
  });

  try {
    const [rows] = await conn.execute(
      `SELECT postagens.canal_venda,
              postagens.numero_pedido_externo,
              postagens_numeros_etiquetas.numero_etiqueta,
              postagens.created_at
       FROM postagens
       JOIN postagens_numeros_etiquetas
         ON postagens.numero_etiqueta_id = postagens_numeros_etiquetas.id
       WHERE postagens.canal_venda IN ('E-commerce', 'Loja')
         AND postagens.created_at > ?`,
      [lastCreatedAt]
    );
    return rows;
  } finally {
    await conn.end();
  }
}
