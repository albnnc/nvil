import type { default as Ajv } from "ajv";
import { useCallback, useContext } from "react";
import { get } from "../../../../../_utils/get.ts";
import { JsFieldContext } from "./js_field_context.tsx";

export interface FieldValidationOptions {
  name: string;
  schema: unknown;
  parentSchema?: unknown;
}

export function useFieldValidation(
  { name, schema, parentSchema }: FieldValidationOptions,
) {
  const {
    utils: { ajv },
  } = useContext(JsFieldContext);
  const key = name.split(".").pop();
  const requiredKeys = get(parentSchema, "required");
  const required = Array.isArray(requiredKeys)
    ? requiredKeys.includes(key)
    : false;
  const validate = useCallback((v: unknown) => {
    if ((v === undefined || v === "") && required) {
      return "Required";
    }
    if (v === "" || v === undefined) {
      return;
    }
    if (ajv) {
      // deno-lint-ignore no-explicit-any
      const validate = (ajv as Ajv).compile(schema as any);
      validate(v);
      const error = validate.errors?.shift();
      if (typeof error?.message === "string") {
        return capitalizeFirst(error.message);
      }
    }
  }, [required]);
  return { required, validate };
}

function capitalizeFirst(data: string) {
  return data.charAt(0).toUpperCase() + data.slice(1);
}
