export function mapearStatus(evento) {
  if (!evento) return "Desconhecido";

  const codigo = evento.codigo || "";
  const descricao = (evento.descricao || "").toLowerCase();

  // Classificação principal por código
  switch (codigo) {
    case "PO":
      return "Postado";

    case "RO":
      return "Em trânsito";

    case "OEC":
      return "Saiu para entrega";

    case "BDE":
      return "Entregue";
  }

  // Fallback por descrição (quando o código não estiver mapeado)
  if (
    descricao.includes("trânsito") ||
    descricao.includes("transferência") ||
    descricao.includes("encaminhado") ||
    descricao.includes("em rota") ||
    descricao.includes("em trânsito")
  ) {
    return "Em trânsito";
  }

  if (
    descricao.includes("saiu para entrega") ||
    descricao.includes("rota de entrega")
  ) {
    return "Saiu para entrega";
  }

  if (
    descricao.includes("entregue") ||
    descricao.includes("objeto entregue")
  ) {
    return "Entregue";
  }

  if (
    descricao.includes("postado") ||
    descricao.includes("objeto postado")
  ) {
    return "Postado";
  }

  return "Desconhecido";
}