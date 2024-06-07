function fold(hash: number, text: string) {
  let i;
  let chr;
  let len;
  if (text.length === 0) {
    return hash;
  }
  for (i = 0, len = text.length; i < len; i++) {
    chr = text.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash < 0 ? hash * -2 : hash;
}

function foldObject(
  hash: number,
  value: Record<string, unknown>,
  seen: unknown[],
) {
  const foldKey = (hash: number, key: string) => {
    return foldValue(hash, value[key], key, seen);
  };
  return Object.keys(value).sort().reduce(foldKey, hash);
}

function foldValue(
  input: number,
  value: unknown,
  key: string,
  seen: unknown[],
): number {
  const hash = fold(fold(fold(input, key), String(value)), typeof value);
  if (value === null) {
    return fold(hash, "null");
  }
  if (value === undefined) {
    return fold(hash, "undefined");
  }
  if (typeof value === "object" || typeof value === "function") {
    if (seen.indexOf(value) !== -1) {
      return fold(hash, "[Circular]" + key);
    }
    seen.push(value);
    const objHash = foldObject(hash, value as Record<string, unknown>, seen);
    if (!("valueOf" in value) || typeof value.valueOf !== "function") {
      return objHash;
    }

    try {
      return fold(objHash, String(value.valueOf()));
    } catch (err) {
      return fold(objHash, "[valueOf exception]" + (err.stack || err.message));
    }
  }
  return fold(hash, value.toString());
}

export function hash(value: unknown) {
  return foldValue(0, value, "", []).toString(16).padStart(8, "0");
}
