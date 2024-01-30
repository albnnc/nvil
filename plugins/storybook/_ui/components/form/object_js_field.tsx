/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import { memo } from "react";
import { get } from "../../../../../_utils/get.ts";
import { Grid } from "./grid.tsx";
import { JsField, JsFieldProps } from "./js_field.tsx";

export const ObjectJsField = memo(({ name, schema }: JsFieldProps) => {
  const properties = get(schema, "properties");
  if (!properties || typeof properties !== "object") {
    return null;
  }
  const children = Object.entries(properties).map(([k, v]) => (
    <JsField
      key={k}
      name={`${name}.${k}`}
      schema={v}
      parentSchema={schema}
    />
  ));
  return <Grid>{children}</Grid>;
});
