import axios from "axios";

import { API_URL } from "@/constants/api";

export async function checkServerConnection(setMessage) {
  try {
    const response = await axios.get(API_URL);
    setMessage(response.data.message);
  } catch (error) {
    setMessage(error.name);
  }
}
