import axios from "axios";

import { API_URL } from "@/constants/api";

export async function checkServerConnection(setMessage) {
  try {
    const response = await axios.get(API_URL);
    const message = response?.data?.message;
    if (typeof message === "string" && message) setMessage(message);
  } catch {
    setMessage("Sin conexión con el servidor");
  }
}
