import { path } from "../deps.ts";

export function relativisePath(value: string, base: string) {
  let result = value;
  if (result.startsWith("file://")) {
    result = path.fromFileUrl(value);
  }
  result = path.relative(base, result);
  if (!result.startsWith(".")) {
    result = "." + path.sep + result;
  }
  return result;
}
