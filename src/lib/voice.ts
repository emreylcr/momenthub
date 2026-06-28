export function createRoomSlug(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);

  const suffix = Math.random().toString(36).slice(2, 8);
  return `mh-${base || "oda"}-${suffix}`;
}

export function toJitsiRoomName(slug: string) {
  return `momenthub-${slug}`.replace(/[^a-zA-Z0-9-]/g, "");
}
