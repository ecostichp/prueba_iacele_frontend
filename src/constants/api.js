function withTrailingSlash(url) {
  if (!url) return ""
  return url.endsWith("/") ? url : `${url}/`
}

// Producción sigue teniendo VITE_API_HOST. Las variables nuevas son para elegir local o prod.
const legacy = import.meta.env.VITE_API_HOST
const mode = import.meta.env.VITE_API_MODE === "prod" ? "prod" : "local"
const selected =
  mode === "prod"
    ? import.meta.env.VITE_API_HOST_PROD || legacy
    : import.meta.env.VITE_API_HOST_LOCAL || legacy

export const API_URL = withTrailingSlash(selected)
