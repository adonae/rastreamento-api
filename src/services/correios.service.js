import axios from "axios";
import config from "../config/env.js";

export async function consultarRastreiosEmLote(codigos, token) {
  if (!Array.isArray(codigos) || codigos.length === 0) {
    return [];
  }

  const params = new URLSearchParams();

  for (const codigo of codigos) {
    params.append("codigosObjetos", codigo);
  }

  const response = await axios.get(
    `${config.correiosBaseUrl}/srorastro/v1/objetos?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: config.requestTimeoutMs,
    },
  );

  return response.data?.objetos || [];
}