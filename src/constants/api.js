const hosts = {
  local: import.meta.env.VITE_API_HOST_LOCAL,
  prod: import.meta.env.VITE_API_HOST_PROD,
}

const mode = import.meta.env.VITE_API_MODE === "prod" ? "prod" : "local"

export const API_URL = hosts[mode]
