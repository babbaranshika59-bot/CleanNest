// Tiny route matcher with :params, e.g. matchPath("/customer/bookings/:id", "/customer/bookings/BK-1001")
// → { id: "BK-1001" }.  Returns null when the pattern does not match.
export function matchPath(pattern, pathname) {
  const clean = (p) => p.replace(/\/+$/, "") || "/";
  const a = clean(pattern).split("/");
  const b = clean(pathname).split("/");
  if (a.length !== b.length) return null;
  const params = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(":")) {
      try {
        params[a[i].slice(1)] = decodeURIComponent(b[i]);
      } catch {
        return null;
      }
    } else if (a[i] !== b[i]) return null;
  }
  return params;
}
