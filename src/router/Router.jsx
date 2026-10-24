import { createContext, useContext, useEffect, useState } from "react";

const RouterContext = createContext(null);

function getHashRoute() {
  const raw = window.location.hash.replace(/^#/, "");
  return raw || "/";
}

export function RouterProvider({ children }) {
  const [route, setRoute] = useState(getHashRoute());

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getHashRoute());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // navigate(to)                    → pushes a history entry
  // navigate(to, { replace: true }) → replaces it (used by redirects so Back still works)
  const navigate = (to, { replace = false } = {}) => {
    const target = to.startsWith("#") ? to.slice(1) : to;
    if (getHashRoute() === target) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (replace) window.location.replace(`#${target}`);
    else window.location.hash = target;
  };

  // path + query parsing, e.g. "/services?category=Cleaning"
  const [pathname, queryString] = route.split("?");
  const query = new URLSearchParams(queryString || "");

  const value = { route, pathname, query, navigate };
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within RouterProvider");
  return ctx;
}

// Convenience link component that uses the hash router
export function Link({ to, children, className, onClick, ...rest }) {
  const { navigate } = useRouter();
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

// Declarative redirect (replaces the current history entry).
export function Redirect({ to }) {
  const { navigate } = useRouter();
  useEffect(() => {
    navigate(to, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);
  return null;
}
