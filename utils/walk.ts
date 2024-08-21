import { isWalkable } from "./is_walkable.ts";

export function walk(
  value: unknown,
  fn: (value: unknown, path: (string | number)[]) => void,
) {
  const inner = (
    value: unknown,
    fn: (value: unknown, path: (string | number)[]) => void,
    path: (string | number)[] = [],
  ) => {
    fn(value, path);
    if (Array.isArray(value)) {
      for (const [i, v] of value.entries()) {
        inner(v, fn, [...path, i]);
      }
    } else if (isWalkable(value)) {
      for (const [k, v] of Object.entries(value)) {
        inner(v, fn, [...path, k]);
      }
    }
  };
  inner(value, fn, []);
}
