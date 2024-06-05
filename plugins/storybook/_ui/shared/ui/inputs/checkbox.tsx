/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  ChangeEvent,
  forwardRef,
  HTMLAttributes,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { FormWidgetProps } from "../../../types/form.ts";

export interface CheckboxProps extends
  Omit<
    HTMLAttributes<HTMLLabelElement>,
    keyof FormWidgetProps | "onKeyDown"
  >,
  FormWidgetProps<boolean> {
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>(
  ({
    value = false,
    onChange,
    readOnly,
    disabled,
    onFocus,
    onBlur,

    indeterminate,
  }) => {
    const ref = useRef<HTMLInputElement>(null);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(Boolean(e.target.checked));
      },
      [onChange],
    );
    useEffect(() => {
      if (ref.current && indeterminate) {
        ref.current.indeterminate = indeterminate;
      }
    }, [indeterminate, value]);

    return (
      <input
        ref={ref}
        type="checkbox"
        checked={value}
        disabled={disabled}
        onChange={(ev) => {
          if (!readOnly) {
            handleChange(ev);
          }
        }}
        css={{ margin: 0 }}
        onBlur={() => onBlur?.()}
        onFocus={() => onFocus?.()}
      />
    );
  },
);
