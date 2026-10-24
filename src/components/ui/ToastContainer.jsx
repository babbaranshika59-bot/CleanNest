import { useNotifications } from "../../context/NotificationContext.jsx";

const ICONS = { success: "✓", error: "✕", info: "i", warning: "!" };

export default function ToastContainer() {
  const { toasts, dismissToast } = useNotifications();
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} role={t.type === "error" ? "alert" : "status"}>
          <span className="toast-icon" aria-hidden="true">{ICONS[t.type] || "i"}</span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => dismissToast(t.id)} aria-label="Dismiss notification">✕</button>
        </div>
      ))}
    </div>
  );
}
