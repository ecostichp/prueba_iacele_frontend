const CABO_TIME_ZONE = "America/Mazatlan";

export function formatCaboDate(value) {
  if (!value) return "";
  const text = String(value).trim();
  const hasZone = /(?:Z|[+-]\d{2}:\d{2})$/.test(text);
  const normalized = hasZone ? text : `${text.replace(" ", "T")}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: CABO_TIME_ZONE,
  });
}
