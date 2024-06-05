/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  FormEvent,
  forwardRef,
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { FormManager } from "../../../types/form.ts";
import { FormContext } from "./context.ts";

export interface FormProps
  extends Omit<
    HTMLAttributes<HTMLFormElement>,
    "onChange" | "onSubmit" | "onReset"
  > {
  manager: FormManager;
  disabled?: boolean;
  readOnly?: boolean;
  validationTriggers?: ("change" | "submit")[];
  onChange?: (manager: FormManager) => void;
  onSubmit?: (manager: FormManager) => void | Promise<void>;
  onReset?: (manager: FormManager) => void;
}

export const SHOW_SUCCESS_DURATION = 1000;

export const Form = forwardRef<HTMLFormElement, FormProps>(
  (
    {
      manager,
      disabled,
      readOnly,
      validationTriggers = ["submit", "change"],
      onChange,
      onSubmit,
      onReset,
      ...rest
    },
    ref
  ) => {
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    const handleReset = useCallback(() => {
      manager.reset();
      onReset?.(manager);
    }, [manager]);

    const contextValue = useMemo(
      () => ({
        manager,
        disabled,
        readOnly,
        submitButtonRef,
        validationTriggers,
      }),
      [manager, disabled, readOnly, validationTriggers]
    );
    const handleSubmit = useCallback(
      async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (manager.submitting) {
          return;
        }

        const valid = manager.validate()[1];
        if (valid) {
          try {
            manager.setSubmitting(true);
            await onSubmit?.(manager);
          } catch (e) {
            console.error(e);
          } finally {
            manager.setSubmitting(false);
            manager.setSubmitted(true);
          }
        }
      },
      [manager]
    );

    useEffect(() => {
      if (validationTriggers?.includes("change")) {
        manager.validate();
      }
      onChange?.(manager);
    }, [validationTriggers, manager.validate]);
    return (
      <FormContext.Provider value={contextValue}>
        <form
          css={{ flex: "1 1 auto", minWidth: "300px" }}
          ref={ref}
          autoComplete="off"
          noValidate
          onSubmit={handleSubmit}
          onReset={handleReset}
          {...rest}
        />
      </FormContext.Provider>
    );
  }
);
