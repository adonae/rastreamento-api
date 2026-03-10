import axios from "axios";
import config from "../config/env.js";

export async function consultarRastreio(codigo, token) {
  const response = await axios.get(
    `${config.correiosBaseUrl}/srorastro/v1/objetos/${codigo}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      params: {
        resultado: "T",
      },
      timeout: config.requestTimeoutMs,
    },
  );

  return response.data;
}