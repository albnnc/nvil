/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  cloneElement,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { get } from "../../../../../../_utils/get.ts";
import { set } from "../../../../../../_utils/set.ts";
import { useDebounce } from "../../../hooks/use_debounce.ts";
import {
  FormFieldValidator,
  FormValidators,
  FormWidgetProps,
} from "../../../types/form.ts";
import { Box, BoxProps } from "../box.tsx";
import { FormContext } from "./context.ts";

export interface FormFieldProps extends Omit<BoxProps, "children"> {
  name: string;
  title?: string;
  description?: string;
  children?:
    | ReactElement<FormWidgetProps>
    // deno-lint-ignore no-explicit-any
    | ((props: FormWidgetProps<any>) => ReactNode);
  required?: boolean;
  disabled?: boolean;
  // deno-lint-ignore no-explicit-any
  onChange?: (v: any) => void;
  validate?: FormFieldValidator;
}

export const FormField = ({
  name,
  title,
  description,
  children,
  required,
  disabled,
  onChange: propsOnChange,
  validate,
  ...rest
}: FormFieldProps) => {
  const {
    manager: {
      values,
      setValues,
      errors,
      dirtyFields,
      setDirtyFields,
      setValidators,
    },
    readOnly,
    disabled: formDisabled,
  } = useContext(FormContext);
  const dirty = useMemo(() => dirtyFields.includes(name), [dirtyFields]);
  const dirtyDebounced = useDebounce(dirty, 10);

  const [fieldValue, fieldError] = useMemo(
    () => [get(values, name), errors[name]] as const,
    [name, values, errors],
  );
  const widgetProps = useMemo<FormWidgetProps>(() => {
    return {
      readOnly,
      disabled: disabled || formDisabled,
      value: fieldValue,
      onChange: (value) => {
        setValues((prevValues) => {
          const nextValues = structuredClone(prevValues);
          set(nextValues, name, value);
          return nextValues;
        });
        propsOnChange?.(value);
        if (!dirty) {
          setDirtyFields((prevValues) => {
            const nextValues = [...prevValues];
            nextValues.push(name);
            return nextValues;
          });
        }
      },
    };
  }, [
    fieldValue,
    readOnly,
    formDisabled,
    disabled,
    dirty,
    fieldError,
    propsOnChange,
  ]);

  const widget = useMemo(() => {
    if (typeof children === "function") {
      return children(widgetProps);
    }
    if (children) {
      return cloneElement(children, widgetProps);
    }
  }, [children, widgetProps]);
  useEffect(() => {
    setValidators((v) => ({
      ...v,
      [name]: (value) => {
        if (required && emptyValues.includes(value)) {
          return "Required";
        }
        return validate?.(value);
      },
    }));
    return () => {
      setValidators((validators) =>
        Object.keys(validators).reduce<FormValidators>(
          (p, k) => (k === name ? p : { ...p, [k]: validators[k] }),
          {},
        )
      );
    };
  }, [name, required, dirty, validate]);
  useEffect(() => {
    return () => {
      setDirtyFields((prevValues) => {
        const nextValues = structuredClone(prevValues);
        const index = nextValues.indexOf(name);
        if (index !== -1) {
          nextValues.splice(index, 1);
        }
        return nextValues;
      });
    };
  }, []);
  return (
    <Box
      css={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        flexWrap: "nowrap",
        gap: "12px",
      }}
      className="formfield"
      {...rest}
    >
      {title && <FormFieldTitle required={required}>{title}</FormFieldTitle>}
      <Box
        className="field-container"
        css={{
          display: "flex",
          flexWrap: "wrap",
          flex: "1 1 auto",
          rowGap: "8px",
          columnGap: "8px",
          container: "field-container / inline-size",
        }}
      >
        <Box
          css={{
            display: "flex",
            "@container field-container (max-width:400px)": {
              width: "100%",
            },
          }}
          className="input_container"
        >
          {widget}
        </Box>

        {dirtyDebounced && fieldError && (
          <Box
            className="formfield_error"
            css={{
              "@container field-container (max-width:400px)": {
                marginLeft: "0px",
                width: "100%",
              },
            }}
          >
            <span
              css={{
                width: "fit-content",
                backgroundColor: "var(--color-form-field-error-bg)",
                color: "var(--color-form-field-error-fg)",
                borderRadius: "4px",
                wordWrap: "break-word",
                padding: "5px 8px",
                minHeight: "28px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {fieldError}
            </span>
          </Box>
        )}
        {description && (
          <Box
            css={{
              width: "100%",
              color: "var(--color-form-field-description-fg)",
            }}
          >
            {description}
          </Box>
        )}
      </Box>
    </Box>
  );
};

const emptyValues = [undefined, null, ""] as unknown[];

export const FormFieldTitle = ({
  children,
  required,
}: BoxProps & { required?: boolean }) => {
  return (
    <label
      className="formfield_title"
      css={{
        minWidth: "70px",
        color: "var(--color-form-field-title-fg)",
      }}
    >
      {children}
      {required && (
        <span
          css={{
            position: "absolute",
            color: "var(--color-form-field-asterisk-fg)",
          }}
        >
          &nbsp;*
        </span>
      )}
    </label>
  );
};
