/** @jsx jsx */
import { jsx } from "@emotion/react";
import { InputHTMLAttributes } from "react";
import { theme } from "../../constants.ts";
import { FormWidgetProps } from "../../types/form_widget_props.ts";

export interface SwitchProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, keyof FormWidgetProps>,
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
    <label
      style={{ opacity: disabled ? 0.5 : 1 }}
      css={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: "22px",
        gap: "1rem",
        position: "relative",
        verticalAlign: "middle",
        userSelect: "none",
        "input:checked + span": {
          backgroundColor: theme.colors.accentForeground,
        },
        "input:checked + span:before": {
          transform: "translateX(18px)",
        },
        "input:focus-visible + span": {
          outlineWidth: "1px",
          outlineStyle: "solid",
          outlineOffset: 1,
        },
        "input:not(:disabled) + span": {
          cursor: "default",
          opacity: 2,
        },
        "input:disabled + span": {
          opacity: 1,
        },
      }}
    >
      <input
        checked={value}
        disabled={disabled}
        css={{
          position: "absolute",
          opacity: 0,
          cursor: "default",
          height: "0",
          width: "0",
        }}
        type="checkbox"
        onBlur={() => onBlur?.()}
        onChange={onChange ? (ev) => onChange?.(ev.target.checked) : undefined}
        onFocus={() => onFocus?.()}
        {...rest}
      />
      <span
        css={{
          position: "relative",
          display: "inline-block",
          boxSizing: "border-box",
          width: "40px",
          minWidth: "40px",
          minHeight: "22px",
          height: "22px",
          borderRadius: "4px",
          verticalAlign: "top",
          backgroundColor: theme.colors.accentForeground,
          "&:before": {
            content: "''",
            position: "absolute",
            top: "3px",
            left: "3px",
            display: "inline-block",
            width: "16px",
            height: "16px",
            borderRadius: "3px",
            backgroundColor: theme.colors.accentOnForeground,
          },
        }}
      />
      {children && <div>{children}</div>}
      {required && (
        <span css={{ color: "red", fontWeight: 600 }}>
          *
        </span>
      )}
    </label>
  );
};
