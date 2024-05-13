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
  extends Omit<InputHTMLAttributes<HTMLInputElement>, keyof FormWidgetProps>,
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
        type === "number" ? (value && !isNaN(+value) ? +value : "") : value
      );
    },
    [onChange]
  );
  return (
    <input
      type={type}
      value={value}
      onChange={onChange ? handleChange : undefined}
      onBlur={() => onBlur?.()}
      onFocus={() => onFocus?.()}
      {...rest}
    />
  );
};
