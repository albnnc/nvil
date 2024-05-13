/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  ChangeEvent,
  InputHTMLAttributes,
  OptionHTMLAttributes,
  ReactElement,
  useCallback,
} from "react";
import { theme } from "../../constants.ts";
import { FormWidgetProps } from "../../types/form_widget_props.ts";

export interface SelectProps
  extends Omit<InputHTMLAttributes<HTMLSelectElement>, keyof FormWidgetProps>,
    FormWidgetProps<string> {
  showEmpty?: boolean;
  children: ReactElement<OptionHTMLAttributes<HTMLOptionElement>>[];
}

export const Select = ({
  value = "",
  children,
  onChange,
  invalid,
  onFocus,
  onBlur,
  showEmpty,
  ...rest
}: SelectProps) => {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      onChange?.(value);
    },
    [onChange]
  );
  return (
    <select
      onBlur={() => onBlur?.()}
      onFocus={() => onFocus?.()}
      onChange={handleChange}
      value={value}
      {...rest}
    >
      {showEmpty && <option value="">-</option>}
      {children}
    </select>
  );
};

export const SelectOption = (
  props: OptionHTMLAttributes<HTMLOptionElement>
) => {
  return <option {...props} />;
};

const backgroundImage =
  "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0iIzU4NjA2OSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNC40MjcgOS40MjdsMy4zOTYgMy4zOTZhLjI1MS4yNTEgMCAwMC4zNTQgMGwzLjM5Ni0zLjM5NkEuMjUuMjUgMCAwMDExLjM5NiA5SDQuNjA0YS4yNS4yNSAwIDAwLS4xNzcuNDI3ek00LjQyMyA2LjQ3TDcuODIgMy4wNzJhLjI1LjI1IDAgMDEuMzU0IDBMMTEuNTcgNi40N2EuMjUuMjUgMCAwMS0uMTc3LjQyN0g0LjZhLjI1LjI1IDAgMDEtLjE3Ny0uNDI3eiIgLz48L3N2Zz4=)";
