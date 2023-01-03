import { path } from "../deps.ts";

export function absolutisePath(value: string, base?: string) {
  if (value.startsWith("file://")) {
    return path.fromFileUrl(value);
  }
  if (path.isAbsolute(value)) {
    return value;
  }
  if (!base) {
    throw new Error(`Unable to complete path "${value}" without base`);
  }
  return path.resolve(base, value);
}
