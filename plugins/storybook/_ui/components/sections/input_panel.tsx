/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { theme } from "../../constants.ts";
import { useDebounce } from "../../hooks/use_debounce.ts";
import { useStorySummary } from "../../hooks/use_story_summary.ts";
import { useUpdateEffect } from "../../hooks/use_update_effect.ts";
import { pushSearchParams } from "../../utils/push_search_params.ts";
import { Grid } from "../form/grid.tsx";
import { JsField } from "../form/js_field.tsx";
import { Form } from "../form/mod.tsx";

export const InputPanel = () => {
  const {
    storyDefs,
    activeStoryDef,
    activeStoryInput,
    activeStoryDefaultInput,
  } = useStorySummary() ?? {};
  const { inputSchema } = activeStoryDef ?? {};
  const inputInitialValue = useMemo(() => {
    return (activeStoryInput ?? activeStoryDefaultInput) as FieldValues;
  }, [
    // Updating on initial load only.
    storyDefs,
  ]);
  if (!storyDefs || !inputSchema) {
    return null;
  }
  return (
    <div
      css={{
        flex: "0 0 400px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.colors.foreground,
        color: theme.colors.onForeground,
      }}
    >
      <div
        css={{
          paddingTop: "1.3rem",
          paddingBottom: "1rem",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          color: "inherit",
          fontSize: "1rem",
          letterSpacing: "0.065em",
          textTransform: "uppercase",
          fontWeight: theme.colorScheme === "dark" ? 300 : 400,
          borderBottom: `1px solid ${theme.colors.accentForeground}`,
        }}
      >
        Input
      </div>
      <div
        css={{
          paddingTop: "1rem",
          paddingLeft: "1rem",
          paddingRight: "1rem",
        }}
      >
        <InputForm
          inputSchema={inputSchema}
          inputInitialValue={inputInitialValue}
        />
      </div>
    </div>
  );
};

interface InputFormProps {
  inputSchema: unknown;
  inputInitialValue: FieldValues;
}

const InputForm = ({ inputSchema, inputInitialValue }: InputFormProps) => {
  const defaultValues = useMemo(() => {
    return { input: inputInitialValue };
  }, [inputInitialValue]);
  const form = useForm({
    defaultValues,
    reValidateMode: "onChange",
  });
  const input = form.watch("input");
  const inputString = JSON.stringify(input);
  const debouncedInputString = useDebounce(inputString, 300);
  useUpdateEffect(() => {
    pushSearchParams(["story-input", debouncedInputString]);
  }, [debouncedInputString]);
  useUpdateEffect(() => {
    form.reset(defaultValues);
  }, [JSON.stringify(defaultValues)]);
  return (
    <Form form={form} onSubmit={() => {}}>
      <Grid>
        <JsField name="input" schema={inputSchema} />
      </Grid>
    </Form>
  );
};
