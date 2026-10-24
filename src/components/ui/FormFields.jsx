import { useId } from "react";

// Reusable controlled form controls built on native HTML elements.
// All accept: label, name, value, onChange, error, hint, required + native props.

export function FormError({ children, id }) {
  if (!children) return null;
  return (
    <div className="field-error" id={id} role="alert">
      {children}
    </div>
  );
}

function Field({ label, error, hint, required, children, id, className = "" }) {
  return (
    <div className={`field ${className}`}>
      {label && (
        <label htmlFor={id}>
          {label}
          {required && <span className="field-required" aria-hidden="true"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <div className="field-hint">{hint}</div>}
      <FormError id={`${id}-err`}>{error}</FormError>
    </div>
  );
}

export function Input({ label, error, hint, required, className, ...rest }) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} required={required} id={id} className={className}>
      <input id={id} className={`input ${error ? "input-invalid" : ""}`} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...rest} />
    </Field>
  );
}

export function Select({ label, error, hint, required, className, options = [], placeholder, children, ...rest }) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} required={required} id={id} className={className}>
      <select id={id} className={`select ${error ? "input-invalid" : ""}`} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
        {children}
      </select>
    </Field>
  );
}

export function Textarea({ label, error, hint, required, className, ...rest }) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} required={required} id={id} className={className}>
      <textarea id={id} className={`textarea ${error ? "input-invalid" : ""}`} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...rest} />
    </Field>
  );
}
