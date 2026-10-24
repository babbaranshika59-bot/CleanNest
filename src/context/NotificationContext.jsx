import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { useAuth } from "./AuthContext.jsx";
import { STORAGE_KEYS } from "../utils/constants.js";
import { uid } from "../utils/format.js";

const NotificationContext = createContext(null);
const MAX_STORED = 100;
const TOAST_MS = 4000;

// Two separate concerns:
//   • toasts        – short-lived, in memory, shown to whoever performed the action
//   • notifications – persisted in localStorage, addressed to a recipient:
//                     { userId } | { providerId } | { role: "admin" }
export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [stored, setStored] = useLocalStorage(STORAGE_KEYS.notifications, [], Array.isArray);
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismissToast = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = "info") => {
      const id = uid("t");
      setToasts((t) => [...t.slice(-3), { id, message, type }]);
      timers.current[id] = setTimeout(() => dismissToast(id), TOAST_MS);
    },
    [dismissToast]
  );

  const notify = useCallback(
    ({ to, message, type = "info", link }) => {
      const n = { id: uid("n"), to, message, type, link, read: false, createdAt: new Date().toISOString() };
      setStored((prev) => [n, ...prev].slice(0, MAX_STORED));
    },
    [setStored]
  );

  const isMine = useCallback(
    (n) => {
      if (!user || !n?.to) return false;
      if (n.to.userId) return n.to.userId === user.id;
      if (n.to.providerId !== undefined) return user.role === "provider" && user.providerId === n.to.providerId;
      if (n.to.role) return user.role === n.to.role;
      return false;
    },
    [user]
  );

  const mine = useMemo(() => stored.filter(isMine), [stored, isMine]);
  const unreadCount = mine.filter((n) => !n.read).length;

  const markRead = (id) => setStored((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () => setStored((prev) => prev.map((n) => (isMine(n) ? { ...n, read: true } : n)));
  const clearMine = () => setStored((prev) => prev.filter((n) => !isMine(n)));

  const value = {
    toasts,
    toast,
    success: (m) => toast(m, "success"),
    error: (m) => toast(m, "error"),
    info: (m) => toast(m, "info"),
    dismissToast,
    notify,
    notifications: mine,
    unreadCount,
    markRead,
    markAllRead,
    clearMine,
  };
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
