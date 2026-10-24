import Button from "./Button.jsx";

export function LoadingState({ label = "Loading…", fullPage }) {
  return (
    <div className={`state state-loading ${fullPage ? "state-full" : ""}`} role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p className="muted">{label}</p>
    </div>
  );
}

export function ErrorState({ error, title = "Something went wrong", onRetry }) {
  const message = typeof error === "string" ? error : error?.message || "Please try again.";
  return (
    <div className="state state-error" role="alert">
      <div className="state-icon" aria-hidden="true">⚠️</div>
      <h3>{title}</h3>
      <p className="muted">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ icon = "📭", title, message, action }) {
  return (
    <div className="state state-empty">
      <div className="state-icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      {message && <p className="muted">{message}</p>}
      {action}
    </div>
  );
}
