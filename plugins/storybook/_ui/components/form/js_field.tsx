/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useContext } from "react";
import { get } from "../../../../../_utils/get.ts";
import { JsFieldContext } from "./js_field_context.tsx";

export interface JsFieldProps {
  name: string;
  schema: unknown;
  parentSchema?: unknown;
}

export const JsField = ({
  name,
  schema,
  parentSchema,
  ...rest
}: JsFieldProps) => {
  const { fields } = useContext(JsFieldContext);
  const type = String(get(schema, "type") || "");
  const field = (() => {
    const layoutField = String(get(schema, "layout.field") || "") || undefined;
    if (layoutField && layoutField !== "default") {
      return layoutField;
    }
    return type;
  })();
  const Component = fields[field];
  if (!Component) {
    return <div>Unable to find field {field}</div>;
  }
  return (
    <Component
      name={name}
      schema={schema}
      parentSchema={parentSchema}
      {...rest}
    />
  );
};
