/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useFormManager } from "../hooks/use_form_manager.ts";
import { FormField } from "../shared/ui/form/field.tsx";
import { Form } from "../shared/ui/form/mod.tsx";
import { Checkbox } from "../shared/ui/inputs/checkbox.tsx";
import { Radio, RadioOption } from "../shared/ui/inputs/radio.tsx";
import { Select } from "../shared/ui/inputs/select.tsx";
import { TextInput } from "../shared/ui/inputs/text.tsx";

const controlsUpdateEvent = new CustomEvent("controls-update");
export const StoryControls = ({
  controls,
}: {
  // deno-lint-ignore no-explicit-any
  controls: Record<string, any>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlValues = JSON.parse(searchParams.get("controls") ?? "{}");
  const fields = Object.entries(controls ?? {});
  const manager = useFormManager({
    initialValues: fields.reduce((acc, [name, props]) => {
      return { ...acc, [name]: urlValues[name] ?? props.default };
    }, {}),
  });
  useEffect(() => {
    setSearchParams(
      (curr) => {
        curr.set("controls", JSON.stringify(manager.values));
        return curr;
      },
      { replace: true },
    );
    globalThis.parent.dispatchEvent(controlsUpdateEvent);
  }, [manager.values]);
  return (
    <Form manager={manager}>
      <table
        css={{
          tableLayout: "fixed",
          borderCollapse: "collapse",
          width: "100%",
          tr: {
            "th, td": {
              padding: "8px",
              borderBottom: "1px solid rgb(208, 215, 222)",
            },
          },
        }}
      >
        {
          /* <thead>
          <tr css={{ textAlign: "left", color: "grey" }}>
            <th css={{ fontWeight: 400 }}>Property</th>
            <th css={{ fontWeight: 400 }}>Control</th>
          </tr>
        </thead> */
        }
        <tbody>
          {Object.entries(controls).map(([name, props]) => {
            const type = props.type;
            const jsxField = (() => {
              if (type === "text") {
                return <TextInput />;
              }
              if (type === "select") {
                return (
                  <Select>
                    {props.items.map((item: string) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                );
              }
              if (type === "checkbox") {
                return <Checkbox />;
              }
              if (type === "radio") {
                return (
                  <Radio>
                    {props.items.map((item: string) => (
                      <RadioOption key={item} value={item}>
                        {item}
                      </RadioOption>
                    ))}
                  </Radio>
                );
              }
              throw new Error("Invalid");
            })();
            return (
              <tr key={name}>
                <td css={{ width: "40%" }}>{name}</td>
                <td css={{ width: "60%" }}>
                  <FormField key={name} name={name}>
                    {jsxField}
                  </FormField>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Form>
  );
};
