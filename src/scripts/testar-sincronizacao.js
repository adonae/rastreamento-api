import { executarSincronizacao } from "../services/sincronizacao.service.js";

console.log("=== TESTE DE SINCRONIZACAO ===\n");

try {
  await executarSincronizacao();
  console.log("\n=== TESTE CONCLUIDO COM SUCESSO ===");
} catch (err) {
  console.error("\n=== TESTE FALHOU ===");
  console.error(err);
  process.exit(1);
}
