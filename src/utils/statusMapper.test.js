import test from "node:test";
import assert from "node:assert/strict";
import { mapearStatus } from "./statusMapper.js";

test("mantem evento de entrega real como Entregue", () => {
  const status = mapearStatus({
    descricao: "Objeto entregue ao destinatário",
  });

  assert.equal(status, "Entregue");
});

test("classifica entrega ao remetente como Devolvido", () => {
  const status = mapearStatus({
    descricao: "Objeto entregue ao remetente",
  });

  assert.equal(status, "Devolvido");
});

test("nao marca inconsistencias de enderecamento como Entregue", () => {
  const status = mapearStatus({
    descricao: "Inconsistências no endereçamento do objeto",
  });

  assert.equal(status, "Desconhecido");
});

test("nao marca problemas de endereco como Entregue", () => {
  const status = mapearStatus({
    descricao: "Endereço insuficiente para entrega do objeto",
  });

  assert.equal(status, "Desconhecido");
});

test("mantem retirada quando evento indica coleta em unidade", () => {
  const status = mapearStatus({
    descricao: "Objeto disponível para retirada em unidade dos Correios",
  });

  assert.equal(status, "Retirada");
});

test("nao marca evento com codigo BDE como Entregue sem texto de entrega", () => {
  const status = mapearStatus({
    codigo: "BDE",
    descricao: "Objeto não entregue - endereço incorreto",
    detalhe:
      "O número indicado para entrega é inexistente. Aguarde a unidade para retirada",
  });

  assert.equal(status, "Retirada");
});

test("mantem transito para objeto encaminhado", () => {
  const status = mapearStatus({
    descricao: "Objeto encaminhado de Unidade de Tratamento",
  });

  assert.equal(status, "Em trânsito");
});
