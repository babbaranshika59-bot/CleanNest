import { RouterProvider, useRouter } from "./router/Router.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import ProvidersPage from "./pages/ProvidersPage.jsx";
import HowItWorksPage from "./pages/HowItWorksPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

const routes = [
  { path: "/", component: HomePage },
  { path: "/services", component: ServicesPage },
  { path: "/providers", component: ProvidersPage },
  { path: "/how-it-works", component: HowItWorksPage },
  { path: "/about", component: AboutPage },
  { path: "/login", component: LoginPage },
  { path: "/signup", component: SignupPage },
];

function Routes() {
  const { pathname } = useRouter();
  const match = routes.find(
    (r) => r.path === pathname || (r.path !== "/" && pathname.startsWith(r.path))
  );
  const Page = match ? match.component : NotFoundPage;
  return <Page />;
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <FavoritesProvider>
          <Navbar />
          <main>
            <Routes />
          </main>
          <Footer />
        </FavoritesProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
