export function mapearStatus(evento) {
  if (!evento?.codigo) return "Desconhecido";

  switch (evento.codigo) {
    case "PO":
      return "Postado";
    case "RO":
      return "Em trânsito";
    case "OEC":
      return "Saiu para entrega";
    case "BDE":
      return "Entregue";
    default:
      return "Desconhecido";
  }
}