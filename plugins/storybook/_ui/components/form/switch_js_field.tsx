/** @jsx jsx */
import { jsx } from "@emotion/react";
import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { get } from "../../../../../_utils/get.ts";
import { Switch } from "../inputs/switch.tsx";
import { Field } from "./field.tsx";
import { JsFieldProps } from "./js_field.tsx";
import { useFieldValidation } from "./js_field_validation.tsx";

export const SwitchJsField = memo(({
  name,
  schema,
  parentSchema,
}: JsFieldProps) => {
  const form = useFormContext();
  const title = String(get(schema, "title") || "");
  const description = String(get(schema, "description") || "");
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
      <Switch />
    </Field>
  );
});
