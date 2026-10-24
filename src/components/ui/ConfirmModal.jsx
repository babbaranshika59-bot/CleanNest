import Modal from "../Modal.jsx";
import Button from "./Button.jsx";

// Confirmation dialog for destructive actions (cancel booking, delete user…).
export default function ConfirmModal({ open, title = "Are you sure?", message, confirmLabel = "Confirm", cancelLabel = "Keep it", danger = true, loading, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={loading ? undefined : onCancel} title={title} maxWidth={440}>
      <div className="confirm">
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
