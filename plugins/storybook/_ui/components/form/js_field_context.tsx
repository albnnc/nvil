import { ComponentType, createContext } from "react";
import { createAjv } from "./create_ajv.tsx";
import { ObjectJsField } from "./object_js_field.tsx";
import { SelectJsField } from "./select_js_field.tsx";
import { SwitchJsField } from "./switch_js_field.tsx";
import { TextJsField } from "./text_js_field.tsx";

export interface JsFieldContextValue {
  // deno-lint-ignore no-explicit-any
  fields: Record<string, ComponentType<any>>;
  utils: Record<string, unknown>;
}

export const defaultJsFieldContextValue: JsFieldContextValue = {
  fields: {
    boolean: SwitchJsField,
    object: ObjectJsField,
    select: SelectJsField,
    string: TextJsField,
  },
  utils: {
    ajv: createAjv({ allErrors: true }),
  },
};

export const JsFieldContext = createContext(
  defaultJsFieldContextValue,
);
