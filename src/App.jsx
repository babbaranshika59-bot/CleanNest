import { RouterProvider, useRouter } from "./router/Router.jsx";
import { ParamsContext } from "./router/ParamsContext.js";
import { matchPath } from "./router/matchPath.js";
import ProtectedRoute from "./router/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { BookingProvider } from "./context/BookingContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ToastContainer from "./components/ui/ToastContainer.jsx";
import HomePage from "./pages/HomePage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import ProvidersPage from "./pages/ProvidersPage.jsx";
import ProviderDetailPage from "./pages/ProviderDetailPage.jsx";
import HowItWorksPage from "./pages/HowItWorksPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import UnauthorizedPage from "./pages/UnauthorizedPage.jsx";
import BookingDetailsPage from "./pages/BookingDetailsPage.jsx";
import CustomerDashboardPage from "./pages/customer/CustomerDashboardPage.jsx";
import MyBookingsPage from "./pages/customer/MyBookingsPage.jsx";
import CustomerProfilePage from "./pages/customer/CustomerProfilePage.jsx";
import ProviderDashboardPage from "./pages/provider/ProviderDashboardPage.jsx";
import ProviderBookingsPage from "./pages/provider/ProviderBookingsPage.jsx";
import ProviderProfilePage from "./pages/provider/ProviderProfilePage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";
import AdminProvidersPage from "./pages/admin/AdminProvidersPage.jsx";
import AdminServicesPage from "./pages/admin/AdminServicesPage.jsx";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage.jsx";

const CUSTOMER = ["customer"];
const PROVIDER = ["provider"];
const ADMIN = ["admin"];

// Route table. `roles` makes a route protected (and role-restricted); `dashboard` hides the footer.
// Patterns support :params (read them with useParams()).
const routes = [
  // Public
  { path: "/", component: HomePage },
  { path: "/services", component: ServicesPage },
  { path: "/providers", component: ProvidersPage },
  { path: "/providers/:id", component: ProviderDetailPage },
  { path: "/how-it-works", component: HowItWorksPage },
  { path: "/about", component: AboutPage },
  { path: "/login", component: LoginPage },
  { path: "/signup", component: SignupPage },
  { path: "/unauthorized", component: UnauthorizedPage },
  // Customer
  { path: "/customer", component: CustomerDashboardPage, roles: CUSTOMER, dashboard: true },
  { path: "/customer/bookings", component: MyBookingsPage, roles: CUSTOMER, dashboard: true },
  { path: "/customer/bookings/:id", component: BookingDetailsPage, roles: CUSTOMER, dashboard: true },
  { path: "/customer/profile", component: CustomerProfilePage, roles: CUSTOMER, dashboard: true },
  // Provider
  { path: "/provider", component: ProviderDashboardPage, roles: PROVIDER, dashboard: true },
  { path: "/provider/bookings", component: ProviderBookingsPage, roles: PROVIDER, dashboard: true },
  { path: "/provider/bookings/:id", component: BookingDetailsPage, roles: PROVIDER, dashboard: true },
  { path: "/provider/profile", component: ProviderProfilePage, roles: PROVIDER, dashboard: true },
  // Admin
  { path: "/admin", component: AdminDashboardPage, roles: ADMIN, dashboard: true },
  { path: "/admin/users", component: AdminUsersPage, roles: ADMIN, dashboard: true },
  { path: "/admin/providers", component: AdminProvidersPage, roles: ADMIN, dashboard: true },
  { path: "/admin/services", component: AdminServicesPage, roles: ADMIN, dashboard: true },
  { path: "/admin/bookings", component: AdminBookingsPage, roles: ADMIN, dashboard: true },
  { path: "/admin/bookings/:id", component: BookingDetailsPage, roles: ADMIN, dashboard: true },
];

function useMatch() {
  const { pathname } = useRouter();
  for (const route of routes) {
    const params = matchPath(route.path, pathname);
    if (params) return { route, params };
  }
  return null;
}

function Routes() {
  const match = useMatch();
  if (!match) return <NotFoundPage />;
  const { route, params } = match;
  const Page = route.component;
  const page = (
    <ParamsContext.Provider value={params}>
      <Page />
    </ParamsContext.Provider>
  );
  return route.roles ? <ProtectedRoute roles={route.roles}>{page}</ProtectedRoute> : page;
}

function Shell() {
  const match = useMatch();
  return (
    <>
      <Navbar />
      <main>
        <Routes />
      </main>
      {!match?.route.dashboard && <Footer />}
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <FavoritesProvider>
          <NotificationProvider>
            <BookingProvider>
              <Shell />
            </BookingProvider>
          </NotificationProvider>
        </FavoritesProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
