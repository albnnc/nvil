/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { get } from "../../../../../_utils/get.ts";
import { TextInput, TextInputProps } from "../inputs/text.tsx";
import { Field } from "./field.tsx";
import { JsFieldProps } from "./js_field.tsx";
import { useFieldValidation } from "./js_field_validation.tsx";

export const TextJsField = memo(({
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
      <Widget schema={schema} />
    </Field>
  );
});

const Widget = ({
  schema,
  value,
  onChange,
}: TextInputProps & { schema: unknown }) => {
  const type = String(get(schema, "type") || "");
  const readOnly = !!get(schema, "readOnly");
  const minimum = wrapNumber(get(schema, "minimum"));
  const maximum = wrapNumber(get(schema, "maximum"));
  const minLength = wrapNumber(get(schema, "minLength"));
  const multipleOf = wrapNumber(get(schema, "multipleOf"));
  const placeholder = get(schema, "layout.placeholder");
  const mappedType = typeof type === "string"
    ? {
      string: "text",
      number: "number",
      integer: "number",
    }[type]
    : "text";
  if (!mappedType) {
    return <div>Invalid schema type</div>;
  }
  const step = (
      type === "integer" &&
      typeof multipleOf === "number" &&
      (!multipleOf || multipleOf % 1 !== 0)
    )
    ? 1
    : multipleOf;
  const sanitizeForInput = (v: string | number | undefined) => {
    return v?.toString();
  };
  const sanitizeForChange = (v: string | number) => {
    const t = String(v ?? "");
    if (mappedType === "number") {
      return t === "" ? "" : Number(t);
    }
    return t;
  };
  return (
    <TextInput
      disabled={readOnly}
      max={maximum}
      min={minimum}
      minLength={minLength}
      placeholder={placeholder ? String(placeholder) : undefined}
      step={step}
      type={(mappedType ?? "text") as string}
      value={sanitizeForInput(value)}
      onChange={(v: string | number) => {
        onChange?.(sanitizeForChange(v));
      }}
    />
  );
};

function wrapNumber(v: unknown): number | undefined {
  return typeof v === "number" ? v : undefined;
}
