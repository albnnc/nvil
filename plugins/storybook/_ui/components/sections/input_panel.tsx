/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import { useEffect, useMemo } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { set } from "../../../../../_utils/set.ts";
import { walk } from "../../../../../_utils/walk.ts";
import { theme } from "../../constants.ts";
import { useDebounce } from "../../hooks/use_debounce.ts";
import { useStoryDefs } from "../../hooks/use_story_defs.ts";
import { useStoryId } from "../../hooks/use_story_id.ts";
import { pushSearchParams } from "../../utils/push_search_params.ts";
import { Grid } from "../form/grid.tsx";
import { JsField } from "../form/js_field.tsx";
import { Form } from "../form/mod.tsx";

export const InputPanel = () => {
  const storyId = useStoryId();
  const [storyDefs = []] = useStoryDefs();
  const story = useMemo(() => {
    return storyDefs.find((v) => v.id === storyId);
  }, [storyId, storyDefs]);
  const { inputSchema } = story ?? {};
  const defaultValues = useMemo(() => {
    const result = {};
    if (inputSchema) {
      walk(inputSchema, (value, path) => {
        if (value !== undefined && path[path.length - 1] === "default") {
          set(
            result,
            ["input", ...path.slice(0, -1).filter((v) => v !== "properties")],
            value,
          );
        }
      });
    }
    return result as FieldValues;
  }, [inputSchema]);
  const form = useForm({
    defaultValues,
    reValidateMode: "onChange",
  });
  const input = form.watch("input");
  const inputString = JSON.stringify(input);
  const debouncedInputString = useDebounce(inputString, 300);
  useEffect(() => {
    pushSearchParams(["story-input", debouncedInputString]);
  }, [debouncedInputString]);
  useEffect(() => {
    form.reset(defaultValues);
  }, [JSON.stringify(defaultValues)]);
  if (!inputSchema) {
    return null;
  }
  return (
    <div
      sx={{
        flex: "0 0 400px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.colors.sidebar,
        color: theme.colors.onSidebar,
      }}
    >
      <div
        sx={{
          pt: "1.3rem",
          pb: "1rem",
          color: "inherit",
          fontSize: "1rem",
          letterSpacing: "0.065em",
          textTransform: "uppercase",
          fontWeight: theme.colorScheme === "dark" ? 300 : 400,
          borderBottom: `1px solid ${theme.colors.accentSidebar}`,
        }}
      >
        Input
      </div>
      <div sx={{ pt: "1rem", px: "1rem" }}>
        <Form form={form} onSubmit={() => {}}>
          <Grid>
            <JsField name="input" schema={inputSchema} />
          </Grid>
        </Form>
      </div>
    </div>
  );
};
