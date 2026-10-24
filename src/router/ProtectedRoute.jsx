import { Redirect, useRouter } from "./Router.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { LoadingState } from "../components/ui/States.jsx";
import UnauthorizedPage from "../pages/UnauthorizedPage.jsx";

// Guards a route. roles=[] / undefined → any signed-in user.
// NOTE: this is a UX convenience for the demo, NOT real security. A real backend must verify
// the user's role on every API request.
export default function ProtectedRoute({ roles, children }) {
  const { user, initializing } = useAuth();
  const { route } = useRouter();

  if (initializing) return <LoadingState label="Checking your session…" fullPage />;
  if (!user) return <Redirect to={`/login?next=${encodeURIComponent(route)}`} />;
  if (roles?.length && !roles.includes(user.role)) return <UnauthorizedPage />;
  return children;
}
