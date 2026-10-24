import { createContext, useContext, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { STORAGE_KEYS } from "../utils/constants.js";

const FavoritesContext = createContext(null);

const isIdList = (v) => Array.isArray(v) && v.every((x) => typeof x === "number");

export function FavoritesProvider({ children }) {
  // Lazy read + validation: corrupt or stale data falls back to []. (Fixes the Stage-1 bug where
  // React StrictMode's double effect wiped saved favorites on reload.)
  const [favorites, setFavorites] = useLocalStorage(STORAGE_KEYS.favorites, [], isIdList);

  const value = useMemo(
    () => ({
      favorites,
      toggleFavorite: (id) =>
        setFavorites((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id])),
      isFavorite: (id) => favorites.includes(id),
      count: favorites.length,
    }),
    [favorites, setFavorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
