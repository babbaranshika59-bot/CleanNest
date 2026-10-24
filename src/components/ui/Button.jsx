// Reusable button. variant: primary | accent | outline | ghost | danger. Shows a busy state.
export default function Button({ variant = "primary", size, block, loading, disabled, children, className = "", type = "button", ...rest }) {
  const cls = ["btn", `btn-${variant}`, size === "sm" ? "btn-sm" : "", block ? "btn-block" : "", className].filter(Boolean).join(" ");
  return (
    <button type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <span className="spinner spinner-inline" aria-hidden="true" />}
      {children}
    </button>
  );
}
