import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService.js";
import { userService } from "../services/userService.js";
import { readStorage, writeStorage, removeStorage } from "../utils/storage.js";
import { STORAGE_KEYS } from "../utils/constants.js";

const AuthContext = createContext(null);

// Demo authentication. The session stores ONLY the user id; the user record comes from the
// (mock) API. Passwords are never stored in plaintext. Role checks in the UI are for demo
// purposes only — a real backend must enforce them.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(() => !!readStorage(STORAGE_KEYS.session, null)?.userId);

  // Restore session once. Also delete the Stage-1 key that held a plaintext password.
  useEffect(() => {
    removeStorage(STORAGE_KEYS.legacyUser);
    const session = readStorage(STORAGE_KEYS.session, null);
    if (!session?.userId) return;
    let cancelled = false;
    userService
      .get(session.userId)
      .then((u) => {
        if (cancelled) return;
        if (u.status === "blocked") removeStorage(STORAGE_KEYS.session);
        else setUser(u);
      })
      .catch(() => !cancelled && removeStorage(STORAGE_KEYS.session)) // stale session (user deleted)
      .finally(() => !cancelled && setInitializing(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const startSession = (u) => {
    writeStorage(STORAGE_KEYS.session, { userId: u.id });
    setUser(u);
  };

  const login = useCallback(async ({ email, password }) => {
    try {
      const u = await authService.login({ email, password });
      startSession(u);
      return { ok: true, user: u };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const signup = useCallback(async (data) => {
    try {
      const u = await authService.signup(data);
      startSession(u);
      return { ok: true, user: u };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    removeStorage(STORAGE_KEYS.session);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch) => {
      if (!user) return { ok: false, error: "Not signed in." };
      const { name, email, phone, address } = patch;
      try {
        const updated = await userService.update(user.id, { name, email, phone, address });
        setUser(updated);
        return { ok: true, user: updated };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, initializing, login, signup, logout, updateProfile, setUser }),
    [user, initializing, login, signup, logout, updateProfile]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
