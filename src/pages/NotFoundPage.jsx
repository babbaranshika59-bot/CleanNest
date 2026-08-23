import { useEffect } from "react";
import { Link } from "../router/Router.jsx";

export default function NotFoundPage() {
  useEffect(() => {
    document.title = "Page not found — CleanNest";
  }, []);

  return (
    <section className="notfound">
      <h1>404</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </section>
  );
}
