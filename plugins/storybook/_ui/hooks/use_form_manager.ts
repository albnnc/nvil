import { useCallback, useMemo, useState } from "react";

import {
  FormDirtyFields,
  FormErrors,
  FormManager,
  FormManagerOptions,
  FormValidators,
  FormValues,
} from "../types/form.ts";
import { hash } from "../utils/hash.ts";
import { get } from "../../../../_utils/get.ts";
import { deepEqual } from "../utils/deep_equal.ts";

export function useFormManager({
  initialValues: propsInitialValues,
}: FormManagerOptions = {}): FormManager {
  const [initialValues, setInitialValues] = useState<FormValues>(
    propsInitialValues ?? {}
  );
  const [dirtyFields, setDirtyFields] = useState<FormDirtyFields>([]);
  const [values, setValues] = useState<FormValues>(initialValues ?? {});
  const [errors, setErrors] = useState<FormErrors>({});
  const [validators, setValidators] = useState<FormValidators>({});
  const valid = useMemo(() => {
    return !hasMeaningfulError(errors);
  }, [errors]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const validate = useCallback(() => {
    const nextErrors: FormErrors = {};
    Object.entries(validators).forEach(([k, v]) => {
      const value = get(values, k);
      nextErrors[k] = v(value);
    });
    if (hash(errors) === hash(nextErrors)) {
      return [errors, valid] as const;
    }
    setErrors(nextErrors);
    return [nextErrors, !hasMeaningfulError(nextErrors)] as const;
  }, [values, errors, validators]);
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setDirtyFields([]);
    setSubmitted(false);
  }, [initialValues]);

  const manager = useMemo<FormManager>(() => {
    return {
      hasChanges: !deepEqual(values, initialValues ?? {}),
      initialValues,
      values,
      setValues,
      errors,
      setErrors,
      validators,
      setValidators,
      submitting,
      setInitialValues,
      setSubmitting,
      dirtyFields,
      setDirtyFields,
      submitted,
      setSubmitted,
      valid,
      validate,
      reset,
    };
  }, [
    initialValues,
    values,
    errors,
    validators,
    dirtyFields,
    submitting,
    submitted,
    valid,
    validate,
  ]);
  return manager;
}

function hasMeaningfulError(errors: FormErrors) {
  return Object.values(errors).some((v) => !!v);
}
