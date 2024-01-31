import { isWalkable } from "../../../../_utils/is_walkable.ts";
import { set } from "../../../../_utils/set.ts";
import { walk } from "../../../../_utils/walk.ts";

export function getSchemaDefaults(schema: unknown) {
  const result = {};
  if (isWalkable(schema)) {
    walk(schema, (value, path) => {
      if (value !== undefined && path[path.length - 1] === "default") {
        set(
          result,
          path.slice(0, -1).filter((v) => v !== "properties"),
          value,
        );
      }
    });
  }
  // deno-lint-ignore no-explicit-any
  return result as any;
}
