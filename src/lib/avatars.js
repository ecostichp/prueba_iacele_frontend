const avatars = import.meta.glob("../assets/avatars/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

export function avatarUrl(fileName) {
  if (!fileName) return undefined;
  return avatars[`../assets/avatars/${fileName}`];
}
