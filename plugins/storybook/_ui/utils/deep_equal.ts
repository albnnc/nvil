import { isObject } from "./is_object.ts";

export function deepEqual(object1: ArgumentType, object2: ArgumentType) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      (areObjects && !deepEqual(val1 as ArgumentType, val2 as ArgumentType)) ||
      (!areObjects && val1 !== val2)
    ) {
      return false;
    }
  }

  return true;
}

type ArgumentType = Record<PropertyKey, unknown>;
