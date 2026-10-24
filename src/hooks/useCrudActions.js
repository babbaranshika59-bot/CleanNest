import { useState } from "react";
import { useNotifications } from "../context/NotificationContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// Create / update / delete wrapper used by admin pages. Emits a toast + persisted notification
// ONLY when the service call succeeds; failures show an error toast and return { ok: false }.
export function useCrudActions({ service, noun, onChanged }) {
  const { success, error, notify } = useNotifications();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const run = async (fn, doneText) => {
    setBusy(true);
    try {
      const data = await fn();
      success(doneText);
      notify({ to: { userId: user.id }, type: "success", message: doneText });
      onChanged?.();
      return { ok: true, data };
    } catch (err) {
      error(err.message || "Something went wrong.");
      return { ok: false, error: err.message };
    } finally {
      setBusy(false);
    }
  };

  const save = (id, data) =>
    id === null || id === undefined
      ? run(() => service.create(data), `${noun} created.`)
      : run(() => service.update(id, data), `${noun} updated.`);
  const remove = (id) => run(() => service.remove(id), `${noun} deleted.`);

  return { busy, save, remove };
}
