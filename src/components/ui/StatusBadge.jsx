import { STATUS_LABELS } from "../../utils/constants.js";

// Coloured pill for a booking status (also used for generic user/provider statuses).
export default function StatusBadge({ status, label }) {
  return <span className={`status-badge status-${status}`}>{label || STATUS_LABELS[status] || status}</span>;
}
