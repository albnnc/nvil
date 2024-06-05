/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  Children,
  forwardRef,
  HTMLAttributes,
  InputHTMLAttributes,
  isValidElement,
  ReactElement,
  ReactNode,
} from "react";

import { FormWidgetProps } from "../../../types/form.ts";
import { Box } from "../box.tsx";

export interface RadioProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, keyof FormWidgetProps>,
    FormWidgetProps<string> {
  children: ReactElement<RadioOptionProps>[];
}
export const Radio = ({
  value,
  readOnly,
  onChange,
  children,
  disabled,
}: RadioProps) => {
  const options = Children.toArray(children).map((child) => {
    if (isValidElement(child)) {
      return {
        props: child.props,
        value: child.props.value,
        label: child.props.children,
      };
    }
    throw new Error("Invalid Child");
  });
  return (
    <Box css={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {options.map((option) => {
        return (
          <RadioOption
            key={option.value}
            readOnly={readOnly}
            disabled={disabled}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
            {...option.props}
          >
            {option.label}
          </RadioOption>
        );
      })}
    </Box>
  );
};

export interface RadioOptionProps extends HTMLAttributes<HTMLLabelElement> {
  children?: ReactNode;
  value?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: () => void;
  readOnly?: boolean;
}

export const RadioOption = forwardRef<HTMLLabelElement, RadioOptionProps>(
  ({ children, onChange, readOnly, checked, disabled, ...rest }, ref) => {
    return (
      <label
        ref={ref}
        css={{
          position: "relative",
          cursor: "pointer",
          "&:hover input ~ .checkmark": {
            backgroundColor: "rgba(79, 121, 197, 0.35)",
          },
          "input:focus-visible ~ .checkmark": {
            outline: "var(--outline)",
          },
          "input:checked ~ .checkmark": {
            backgroundColor: "rgba(79, 121, 197)",
          },
          "input:checked ~ .checkmark:after": {
            opacity: 1,
            transform: "scale(1)",
          },
        }}
        {...rest}
      >
        <input
          disabled={disabled}
          type="radio"
          css={{ margin: 0 }}
          checked={checked}
          onChange={readOnly ? undefined : onChange}
        />
        {children && (
          <span css={{ marginLeft: "6px", color: "rgba(57, 57, 57, 1)" }}>
            {children}
          </span>
        )}
      </label>
    );
  },
);
