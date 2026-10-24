import { useCallback, useState } from "react";

// Controlled-form helper: values, field errors, change handlers.
//   const form = useFormState(initial, validateFn);
//   <Input {...form.field("name")} />   // gives { name, value, onChange, error }
export function useFormState(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const setField = useCallback((name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  }, []);

  const field = (name) => ({
    name,
    value: values[name] ?? "",
    error: errors[name],
    onChange: (e) => setField(name, e.target.value),
  });

  const validateAll = () => {
    const next = validate ? validate(values) : {};
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const reset = useCallback((next) => {
    setValues(next);
    setErrors({});
  }, []);

  return { values, errors, setErrors, setField, field, validateAll, reset };
}
