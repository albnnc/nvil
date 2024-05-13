/** @jsx jsx */
import { jsx } from "@emotion/react";
import { InputHTMLAttributes } from "react";
import { theme } from "../../constants.ts";
import { FormWidgetProps } from "../../types/form_widget_props.ts";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, keyof FormWidgetProps>,
    FormWidgetProps<boolean> {
  required?: boolean;
}

export const Switch = ({
  required,
  value,
  disabled,
  invalid, // TODO
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  children,
  ...rest
}: SwitchProps) => {
  return (
    <input
      checked={value}
      disabled={disabled}
      type="checkbox"
      onBlur={() => onBlur?.()}
      onChange={onChange ? (ev) => onChange?.(ev.target.checked) : undefined}
      onFocus={() => onFocus?.()}
      {...rest}
    />
  );
};
