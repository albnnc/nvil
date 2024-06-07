import { Dispatch, SetStateAction } from "react";

export type FormFieldValidator<T = unknown> = (value: T) => string | undefined;

export type FormValues = Record<string, unknown>;
export type FormErrors = Record<string, string | undefined>;
export type FormDirtyFields = string[];
export type FormValidators = Record<string, FormFieldValidator>;

export interface FormManagerOptions {
  initialValues?: Record<string, unknown>;
}

export interface FormManager extends FormManagerOptions {
  values: FormValues;
  setValues: Dispatch<SetStateAction<FormValues>>;
  errors: FormErrors;
  setErrors: Dispatch<SetStateAction<FormErrors>>;
  dirtyFields: FormDirtyFields;
  setDirtyFields: Dispatch<SetStateAction<FormDirtyFields>>;
  validators: FormValidators;
  setValidators: Dispatch<SetStateAction<FormValidators>>;
  submitting: boolean;
  setSubmitting: Dispatch<SetStateAction<boolean>>;
  setInitialValues: Dispatch<SetStateAction<FormValues>>;
  submitted: boolean;
  setSubmitted: Dispatch<SetStateAction<boolean>>;
  valid: boolean;
  hasChanges: boolean;
  validate: () => readonly [FormErrors, boolean];
  reset: () => void;
}

export interface FormWidgetDepiction {
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
}

export interface FormWidgetProps<T = unknown> extends FormWidgetDepiction {
  value?: T;
  onChange?: (value: T) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}
