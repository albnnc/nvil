export function set(
  data: Record<PropertyKey, unknown>,
  path: string | (string | number)[],
  value: unknown,
) {
  const segments = Array.isArray(path) ? path : path.split(".");
  const length = segments.length;
  for (let i = 0; i < length - 1; i++) {
    const segment = segments[i];
    if (!data[segment] || typeof data[segment] !== "object") {
      data[segment] = {};
    }
    data = data[segment] as Record<PropertyKey, unknown>;
  }
  data[segments[length - 1]] = value;
}
