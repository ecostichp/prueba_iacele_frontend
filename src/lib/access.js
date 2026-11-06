function normalizeTitle(jobTitle) {
  return (jobTitle || "")
    .trim()
    .toLocaleLowerCase("es-MX")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function canSeeManagerMenu(jobTitle) {
  const title = normalizeTitle(jobTitle);
  if (!title) return false;
  if (title.endsWith("general")) return true;
  const words = title.split(/[^a-z0-9]+/).filter(Boolean);
  return words.includes("gerente");
}

export function canSeeDatabaseMenu(jobTitle) {
  return normalizeTitle(jobTitle) === "director general";
}
