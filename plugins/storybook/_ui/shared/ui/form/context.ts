import { createContext, RefObject, useContext } from "react";
import { FormProps } from "./mod.tsx";

export type FormContextValue =
  & Pick<
    FormProps,
    "manager" | "disabled" | "readOnly" | "validationTriggers"
  >
  & {
    submitButtonRef: RefObject<HTMLButtonElement>;
  };

export const FormContext = createContext<FormContextValue>(
  new Proxy(
    {},
    {
      get() {
        throw new Error("FormContext is not initialized");
      },
    },
  ) as FormContextValue,
);

export function useFormContext() {
  return useContext(FormContext);
}
