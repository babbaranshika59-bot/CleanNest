import { useEffect } from "react";
import { Link } from "../router/Router.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { dashboardPathFor } from "../utils/constants.js";

export default function UnauthorizedPage() {
  const { user } = useAuth();
  useEffect(() => {
    document.title = "Access denied — CleanNest";
  }, []);
  return (
    <section className="notfound">
      <h1>403</h1>
      <p>You don't have permission to view this page{user ? ` with a ${user.role} account` : ""}.</p>
      <Link to={user ? dashboardPathFor(user.role) : "/login"} className="btn btn-primary">
        {user ? "Go to my dashboard" : "Log in"}
      </Link>
    </section>
  );
}
