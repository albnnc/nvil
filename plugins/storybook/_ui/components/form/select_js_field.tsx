/** @jsx jsx */
import { jsx } from "@emotion/react";
import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { get } from "../../../../../_utils/get.ts";
import { Select, SelectOption } from "../inputs/select.tsx";
import { Field } from "./field.tsx";
import { JsFieldProps } from "./js_field.tsx";
import { useFieldValidation } from "./js_field_validation.tsx";

export const SelectJsField = memo(({
  name,
  schema,
  parentSchema,
}: JsFieldProps) => {
  const form = useFormContext();
  const title = String(get(schema, "title") || "");
  const description = String(get(schema, "description") || "");
  const placeholder = String(get(schema, "layout.placeholder") || "");
  const showEmpty = !!get(schema, "layout.showEmpty");
  const oneOf = get(schema, "oneOf");
  const toPickFrom = Array.isArray(oneOf) ? oneOf : [];
  const { required, validate } = useFieldValidation({
    name,
    schema,
    parentSchema,
  });
  return (
    <Field
      required={required}
      title={title}
      description={description}
      {...form.register(name, { validate })}
    >
      <Select
        showEmpty={showEmpty}
        placeholder={placeholder ? String(placeholder) : undefined}
      >
        {toPickFrom.reduce((p, v, i) => {
          if (
            typeof v === "object" &&
            (typeof v.const === "string" || typeof v.const === "undefined")
          ) {
            p.push(
              <SelectOption key={i} value={v.const}>
                {String(v.const)}
              </SelectOption>,
            );
          }
          return p;
        }, [])}
      </Select>
    </Field>
  );
});
