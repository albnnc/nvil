export function isWalkable(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object";
}
