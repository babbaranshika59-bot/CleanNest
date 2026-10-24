import { useCallback, useEffect, useRef, useState } from "react";

// Runs an async function and exposes { data, loading, error, reload }.
// Ignores out-of-date responses (race-safe) and supports retry via reload().
//   const { data, loading, error, reload } = useAsync(() => providerService.list(params), [params.q]);
export function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(asyncFn);
  fnRef.current = asyncFn; // eslint-disable-line react-hooks/refs

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((s) => ({ ...s, loading: true, error: null }));
    fnRef
      .current()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error) => !cancelled && setState((s) => ({ ...s, loading: false, error })));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
