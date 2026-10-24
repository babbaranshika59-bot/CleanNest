import { useEffect, useState } from "react";
import { readStorage, writeStorage } from "../utils/storage.js";

// useState that persists to localStorage. Reads lazily (so StrictMode can't clobber saved data),
// tolerates corrupt JSON, and accepts an optional validator for stale/invalid shapes.
export function useLocalStorage(key, initialValue, validate) {
  const [value, setValue] = useState(() => {
    const stored = readStorage(key, undefined);
    if (stored === undefined) return initialValue;
    if (validate && !validate(stored)) return initialValue;
    return stored;
  });

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}
