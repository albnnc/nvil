/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import {
  cloneElement,
  HTMLAttributes,
  LabelHTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
  useEffect,
} from "react";
import { useFormContext, UseFormRegisterReturn } from "react-hook-form";
import { get } from "../../../../../_utils/get.ts";
import { theme } from "../../constants.ts";
import { FormWidgetProps } from "../../types/form_widget_props.ts";
import { TextInput } from "../inputs/text.tsx";

export interface FieldProps extends
  Omit<
    HTMLAttributes<HTMLDivElement>,
    "children" | keyof UseFormRegisterReturn
  >,
  UseFormRegisterReturn {
  title?: string;
  description?: ReactNode | ((props: { value: unknown }) => ReactNode);
  shouldUnregister?: boolean;
  // deno-lint-ignore no-explicit-any
  children?: ReactElement<FormWidgetProps & { ref?: Ref<any> }>;
}

export const Field = ({
  // FormFieldProps
  title,
  description,
  children,
  // UseFormRegisterReturn
  onChange,
  onBlur,
  name,
  min,
  max,
  maxLength,
  minLength,
  shouldUnregister = true,
  pattern,
  required,
  disabled,
  // Others
  id,
  ...rest
}: FieldProps) => {
  const form = useFormContext();
  const value = form.watch(name);
  const error = get(form.formState.errors, name);
  const widgetProps: FormWidgetProps = {
    value: value,
    disabled,
    invalid: !!error,
    id,
    onChange: (value: unknown) => {
      onChange?.({
        target: { name, value },
        type: "change",
      });
    },
  };
  useEffect(() => {
    return () => {
      shouldUnregister && form.unregister(name);
    };
  }, []);
  return (
    <FieldContainer
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        justifyContent: "start",
      }}
      {...rest}
    >
      {title && (
        <FieldTitle invalid={!!error} required={required} htmlFor={name}>
          {title}
        </FieldTitle>
      )}
      {children
        ? (
          cloneElement(children, { ...widgetProps })
        )
        : (
          <TextInput
            id={name}
            min={min}
            max={max}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            {
              // deno-lint-ignore no-explicit-any
              ...(widgetProps as any)
            }
          />
        )}
      {description && (
        <FieldDescription sx={{ marginTop: "var(--space-xs)" }}>
          {description instanceof Function
            ? description({ value })
            : description}
        </FieldDescription>
      )}
      {!!error && (
        <FieldError sx={{ marginTop: "var(--space-xs)" }}>
          {get(error, "message")}
        </FieldError>
      )}
    </FieldContainer>
  );
};

export const FieldDescription = (props: HTMLAttributes<HTMLDivElement>) => (
  <div
    sx={{
      fontSize: "0.85rem",
      letterSpacing: "0.065em",
      opacity: 0.65,
    }}
    {...props}
  />
);

export interface FieldTitleProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  invalid?: boolean;
}

export const FieldTitle = ({ required, ...rest }: FieldTitleProps) => {
  return (
    <label
      sx={{
        width: "fit-content",
        fontSize: "0.85rem",
        letterSpacing: "0.065em",
        textTransform: "uppercase",
        fontWeight: theme.colorScheme === "dark" ? 300 : 400,
        marginBottom: "0.5rem",
        ...(required && {
          "&::after": {
            content: '"*"',
            paddingLeft: "4px",
            color: "var(--color-danger-fg)",
          },
        }),
      }}
      {...rest}
    />
  );
};

export const FieldError = (props: HTMLAttributes<HTMLDivElement>) => (
  <div
    sx={{
      fontSize: "0.85rem",
      letterSpacing: "0.065em",
      color: "red",
    }}
    {...props}
  />
);

export const FieldContainer = (props: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        justifyContent: "start",
      }}
      {...props}
    />
  );
};
