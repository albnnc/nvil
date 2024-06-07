/** @jsx jsx */
import { jsx } from "@emotion/react";
import { forwardRef, InputHTMLAttributes, Ref } from "react";

import { FormWidgetProps } from "../../../types/form.ts";

export interface TextInputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, keyof FormWidgetProps>,
    FormWidgetProps<string> {}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      disabled,
      onChange,
      onFocus,
      onBlur,
      autoComplete,
      value = "",
      placeholder,
      ...rest
    },
    ref,
  ) => {
    return (
      <input
        ref={ref}
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onFocus={() => onFocus?.()}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={(e) => onBlur?.()}
        disabled={disabled}
        {...rest}
      />
    );
  },
);
