/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  ChangeEvent,
  forwardRef,
  InputHTMLAttributes,
  useCallback,
} from "react";
import { theme } from "../../constants.ts";
import { FormWidgetProps } from "../../types/form_widget_props.ts";

export interface TextInputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, keyof FormWidgetProps>,
    FormWidgetProps<string | number> {}

export const TextInput = ({
  value,
  invalid,
  onChange,
  onFocus,
  onBlur,
  type = "text",
  ...rest
}: TextInputProps) => {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      onChange?.(
        type === "number" ? (value && !isNaN(+value) ? +value : "") : value,
      );
    },
    [onChange],
  );
  return (
    <input
      type={type}
      value={value}
      onChange={onChange ? handleChange : undefined}
      onBlur={() => onBlur?.()}
      onFocus={() => onFocus?.()}
      css={{
        width: "100%",
        verticalAlign: "middle",
        fontSize: "0.85rem",
        padding: "0.35rem 0.65rem",
        lineHeight: "100%",
        backgroundColor: "transparent",
        fontWeight: theme.colorScheme === "dark" ? 300 : 400,
        letterSpacing: "0.065em",
        borderRadius: "4px",
        border: `1px solid ${theme.colors.accentSidebar}`,
        "&:focus-visible": {
          outline: "none",
          borderColor: theme.colors.onSidebar,
        },
        "&::placeholder": {
          color: "inherit",
          opacity: 0.5,
        },
        "&:disabled": {
          opacity: 0.5,
        },
        ...(invalid && {
          "&:not(:focus-visible)": {
            borderColor: "red",
          },
        }),
      }}
      {...rest}
    />
  );
};
