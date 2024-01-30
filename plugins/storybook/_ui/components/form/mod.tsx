/** @jsx jsx */
import { jsx } from "@emotion/react";
import { HTMLAttributes } from "react";
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";

export interface FormProps<T extends FieldValues = FieldValues>
  extends Omit<HTMLAttributes<HTMLFormElement>, "onSubmit" | "onChange"> {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
}

export const Form = <T extends FieldValues = FieldValues>(
  { form, onSubmit, children, ...rest }: FormProps<T>,
) => {
  return (
    <form
      noValidate
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(async (...args) => {
          try {
            await onSubmit?.(...args);
          } catch (e) {
            console.error(e.message);
            form.setError("root", e.message);
          }
        })(e);
      }}
      {...rest}
    >
      <FormProvider {...form}>
        {children}
      </FormProvider>
    </form>
  );
};
