export function mapearStatus(evento) {
  if (!evento) return "Desconhecido";

  const codigo = (evento.codigo || "").toUpperCase().trim();
  const descricao = (evento.descricao || "").toLowerCase().trim();
  const detalhe = (evento.detalhe || "").toLowerCase().trim();
  const textoCompleto = `${descricao} ${detalhe}`.trim();

  // 1. Prioridades mais específicas primeiro

  // Retirada em agência / ponto indicado
  if (
    textoCompleto.includes("retirada") ||
    textoCompleto.includes("retirar") ||
    textoCompleto.includes("aguardando retirada") ||
    textoCompleto.includes("disponível para retirada") ||
    textoCompleto.includes("encaminhado para retirada") ||
    textoCompleto.includes("endereço indicado") ||
    textoCompleto.includes("aguarda retirada")
  ) {
    return "Retirada";
  }

  // Tributação / pagamento pendente
  if (
    textoCompleto.includes("tributado") ||
    textoCompleto.includes("aguardando pagamento") ||
    textoCompleto.includes("pagamento do despacho postal") ||
    textoCompleto.includes("fiscalização aduaneira") ||
    textoCompleto.includes("taxa") ||
    textoCompleto.includes("objeto sujeito à tributação")
  ) {
    return "Tributado";
  }

  // Tentativa de entrega
  if (
    textoCompleto.includes("tentativa de entrega") ||
    textoCompleto.includes("destinatário ausente") ||
    textoCompleto.includes("entrega não realizada") ||
    textoCompleto.includes("carteiro não atendido") ||
    textoCompleto.includes("logradouro com numeração irregular") ||
    textoCompleto.includes("mudou-se") ||
    textoCompleto.includes("recusado") ||
    textoCompleto.includes("cliente ausente")
  ) {
    return "Tentativa de entrega";
  }

  // Devolução / retorno
  if (
    textoCompleto.includes("devolvido ao remetente") ||
    textoCompleto.includes("objeto devolvido") ||
    textoCompleto.includes("devolução autorizada") ||
    textoCompleto.includes("em devolução") ||
    textoCompleto.includes("retorno ao remetente")
  ) {
    return "Devolvido";
  }

  // Entregue
  if (
    codigo === "BDE" ||
    textoCompleto.includes("objeto entregue") ||
    textoCompleto.includes("entregue ao destinatário") ||
    textoCompleto.includes("entregue")
  ) {
    return "Entregue";
  }

  // Saiu para entrega
  if (
    codigo === "OEC" ||
    textoCompleto.includes("saiu para entrega") ||
    textoCompleto.includes("rota de entrega") ||
    textoCompleto.includes("em rota de entrega")
  ) {
    return "Saiu para entrega";
  }

  // Postado
  if (
    codigo === "PO" ||
    textoCompleto.includes("objeto postado") ||
    textoCompleto.includes("postado")
  ) {
    return "Postado";
  }

  // 2. Mapeamento por código conhecido
  switch (codigo) {
    case "RO":
      return "Em trânsito";
  }

  // 3. Fallback por descrição para trânsito
  if (
    textoCompleto.includes("trânsito") ||
    textoCompleto.includes("transferência") ||
    textoCompleto.includes("encaminhado") ||
    textoCompleto.includes("em rota") ||
    textoCompleto.includes("em trânsito") ||
    textoCompleto.includes("objeto em transferência") ||
    textoCompleto.includes("objeto encaminhado")
  ) {
    return "Em trânsito";
  }

  return "Desconhecido";
}