# CleanNest – Local Home Services Directory

CleanNest is a local home services directory web application that helps users find trusted service providers for everyday home needs. Customers can browse providers, book services and track their bookings; providers can manage requests; and admins can manage the whole platform.

> **Status:** Evaluation-II. The project is still **frontend-only**: data is stored in the browser (`localStorage`) behind a mock REST API, and the code is structured so a real backend can be connected later.

## 📌 Project Overview

Finding reliable home service providers can be difficult and time-consuming. CleanNest brings different home services together in one place.

Service categories:

* 🧹 Home Cleaning
* 💇 Salon & Beauty
* ❄️ AC & Appliance Repair
* 🎨 Painting
* 🔧 Plumbing

The app has **three roles**: Customer, Service Provider and Admin.

## ✨ Features

**Public**
* Responsive navigation bar and hero section
* Search by service and location (debounced), category filters, sorting and pagination
* Provider cards, details modal and a full provider page (`/providers/:id`)
* Favorites (saved in the browser)
* Services, Providers, How It Works, About, Login and Sign Up pages

**Customer**
* Dashboard with booking counts (total, pending, confirmed, completed, cancelled) and recent bookings
* Book a provider (validated form, duplicate-submit protection)
* My Bookings with status tabs, search, sort and pagination
* Booking details with a status timeline
* Cancel a booking with a confirmation modal
* Profile view and edit

**Service Provider**
* Dashboard with stats and earnings
* Accept / reject new requests, mark jobs completed
* Edit business profile, add or remove services, set availability

**Admin**
* Overview statistics
* Create, Read, Update, Delete for **users, providers, service categories and bookings**
* Searchable, sortable, filterable tables with delete confirmations
* Developer tools: simulate a network failure, reset demo data

**Platform-wide**
* Role-based protected routes, 403 and 404 pages
* One shared booking list, so every status change shows for customer, provider and admin
* Toast messages and a notification bell (saved in the browser)
* Loading, error (with retry), empty and success states
* Reusable UI kit: forms, modal, confirm modal, tabs, dropdown, tables, badges

## 📄 Routes

| Area | Routes |
| --- | --- |
| Public | `/`, `/services`, `/providers`, `/providers/:id`, `/how-it-works`, `/about`, `/login`, `/signup`, `/unauthorized` |
| Customer | `/customer`, `/customer/bookings`, `/customer/bookings/:id`, `/customer/profile` |
| Provider | `/provider`, `/provider/bookings`, `/provider/bookings/:id`, `/provider/profile` |
| Admin | `/admin`, `/admin/users`, `/admin/providers`, `/admin/services`, `/admin/bookings`, `/admin/bookings/:id` |

Unknown paths show a 404 page. Visiting a protected page while logged out redirects to login, and the wrong role sees a 403 page.

## 🛠️ Technologies Used

* **React** (functional components, JSX) – UI
* **JavaScript, HTML5, CSS3** – plain CSS, no UI library
* **Vite** – dev server and build tool
* **Native `fetch()`** – API calls (no Axios)
* **Git & GitHub** – version control and team collaboration

No Tailwind, TypeScript, Bootstrap, Redux or other extra libraries are used.

## ⚛️ React Concepts Used

* Functional components, JSX, props, composition and reusable components
* Hooks: `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useContext`, `useId`
* **Context API:** `AuthContext`, `FavoritesContext`, `NotificationContext`, `BookingContext`
* **Custom hooks:** `useLocalStorage`, `useDebouncedValue`, `useAsync`, `useListControls`, `useFormState`, `useCrudActions`, `useProviderSearch`, `useBookingActions`
* **Custom hash-based router** with dynamic route parameters (`:id`), redirects and protected routes (we do not use React Router)
* Controlled forms with field-level validation
* Debounced search, filtering, sorting and pagination

## 🗂️ Project Structure

```
src/
  router/       Router, matchPath, ParamsContext, ProtectedRoute
  context/      Auth, Favorites, Notification, Booking contexts
  services/     apiClient (fetch), mockServer, seedData, and one service per resource
  hooks/        reusable custom hooks
  components/   existing components, plus ui/ (UI kit) and booking/
  layouts/      DashboardLayout
  pages/        public pages, customer/, provider/, admin/
  utils/        constants, validators, bookingRules, format, storage, hash
  config/       navigation
  styles/       plain CSS files
scripts/        service-layer smoke tests
```

## 🔄 Booking Lifecycle

```
pending ──► confirmed ──► completed
   ├──► rejected
   └──► cancelled   (also possible from confirmed)
```

| Action | Customer (own) | Provider (own) | Admin |
| --- | :-: | :-: | :-: |
| Create booking | ✅ | – | – |
| Accept / reject a pending request | – | ✅ | ✅ |
| Mark completed | – | ✅ | ✅ |
| Cancel | ✅ | ✅ (confirmed only) | ✅ |
| Edit details / delete | – | – | ✅ |

## 🌐 API Layer (native `fetch()`)

Pages never read or write `localStorage` data directly. They call services (`providerService`, `bookingService`, `userService`, `serviceService`, `authService`), which call `apiClient.request()`:

* If `VITE_API_BASE_URL` is set (for example `http://localhost:4000/api`), real `fetch()` calls go to that server.
* Otherwise, an in-browser **mock REST server** answers, with data stored under `cleannest.db.*` keys in `localStorage`.

Demonstrated patterns: loading, success and error states, a "Try again" retry button, one automatic retry for GET requests, and paginated lists.

```

### 🔑 Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Customer | customer@cleannest.com | customer123 |
| Provider | provider@cleannest.com | provider123 |
| Admin | admin@cleannest.com | admin123 |

You can also register new Customer or Provider accounts on the Sign Up page. Admins cannot self-register.

## ✅ Manual Test Checklist

1. Open `/#/admin` while logged out: you are redirected to login. Log in as Customer: you see the 403 page.
2. As Customer, search providers (debounced), open a provider, book with invalid data (errors show), then book correctly. The booking appears in My Bookings.
3. Submit the same booking again: it is rejected as a duplicate.
4. As the Provider, accept the request. Log in as Customer again: the status is Confirmed and the bell shows a notification.
5. As Customer, cancel a pending booking from the confirmation modal.
6. As Admin, create, edit and delete a user, provider and category. Deleting a category that still has providers is blocked.
7. Admin → Developer tools → Simulate network failure, open Providers, see the error state, switch it off and press "Try again".
8. Resize to about 390 px: the sidebar becomes a tab strip and tables become labelled cards.

## 🤝 Collaboration

The project was developed by a three-member team using GitHub, with separate branches and commits per feature.

| Member | Area |
| --- | --- |
| Member 1 | Home, Services, reusable UI kit, Admin panel |
| Member 2 | Providers, Booking system, Customer and Provider dashboards |
| Member 3 | Auth, Router, global state, notifications, service-layer core |

Shared files (`App.jsx`, `main.jsx`, `utils/constants.js`, `config/navigation.js`, `global.css`, `README.md`) were edited by one person at a time, using `git pull --rebase` before each commit.

## ⚠️ Known Limitations

* **Demo security only.** Role checks, the password hash (`utils/hash.js`) and the mock API are for demonstration. A real backend must authenticate every request, enforce roles, and hash passwords with bcrypt or argon2.
* Data lives only in this browser's `localStorage` and is not shared between devices.
* Payments are mocked; payment status becomes "paid" when a job is completed.
* Search and filter state is read from the URL on load but not written back.
* No live sync between browser tabs.
* Bookings store a copy of customer and provider names, so renaming a user does not update old bookings (provider and category renames are cascaded).

## 🔮 Future Enhancements


* Real payment gateway
* Service ratings and reviews
* Real-time provider availability
* Location-based provider recommendations
* Automated component and end-to-end tests

## 🎯 Project Objective

CleanNest provides a simple, organized and user-friendly platform for discovering and booking local home service providers, while demonstrating practical frontend skills: React, Context API, custom hooks, routing, forms and validation, and a REST-style service layer.

## 📜 License

This project was developed for academic/educational purposes as part of a university group project.
