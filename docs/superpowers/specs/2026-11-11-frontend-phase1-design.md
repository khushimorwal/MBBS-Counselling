# Student Portal Frontend — Phase 1 Design

Date: 2026-11-11
Location: `FRONTEND/next.js`

## Goal

Build the student-facing portal for the MBBS counselling system. It talks to the existing Express backend (`BACKEND`, default `http://localhost:3000`). The full portal is split into 4 phases; each phase gets its own spec, plan and build:

1. **Foundation + Auth + Profile** (this spec)
2. Colleges + Applications
3. Documents + Entrance exams
4. Counselling (requests, appointments, sessions, notes, follow-ups)

## Stack

- Next.js, App Router, JavaScript (no TypeScript)
- Tailwind CSS 4
- `axios` for API calls
- Auth token in `localStorage` (same approach as `ADMIN/react.js`)

## Scope (Phase 1)

### Pages

| Route | Access | Purpose |
|---|---|---|
| `/login` | public | Email + password login |
| `/signup` | public | Name, email, password signup (backend assigns Student role) |
| `/forgot-password` | public | 3 steps: email, OTP, new password |
| `/dashboard` | protected | Welcome message, profile completeness summary, links |
| `/profile` | protected | View and edit student profile, upload profile image |

### Backend APIs used

| Action | Endpoint |
|---|---|
| Login | `POST /login` |
| Signup | `POST /signup` |
| Send OTP | `POST /forgotpassword` |
| Verify OTP | `POST /verifyforgototp` |
| Reset password | `POST /resetpassword` |
| Get profile | `GET /student-profile` |
| Save profile | `PUT /student-profile` |
| Upload profile image | `PUT /student-profile/profile-image` (multipart field `profileImage`) |

Request and response shapes are read from the controllers during planning, not guessed here.

### Out of scope

Colleges, applications, documents, entrance exams, counselling. No test framework in phase 1 (manual testing against the local backend).

## Structure

```
FRONTEND/next.js/
  app/
    (auth)/            public pages + layout
      login/page.js
      signup/page.js
      forgot-password/page.js
    (portal)/          protected pages + layout (Navbar, auth guard)
      dashboard/page.js
      profile/page.js
    layout.js          root layout, providers
  src/
    lib/api.js         axios instance
    context/AuthContext.js
    components/        ProtectedRoute, Navbar, FormField, Button, Toast
  .env.example         NEXT_PUBLIC_API_URL
```

## Units

- **`lib/api.js`**: axios instance. Base URL from `NEXT_PUBLIC_API_URL`; if unset in production build, fail loudly instead of falling back to localhost. Request interceptor adds `Authorization: Bearer <token>`. Response interceptor: on 401, clear token and redirect to `/login`.
- **`AuthContext`**: holds `user` and `token`. Exposes `login()`, `signup()`, `logout()`. Restores session from `localStorage` on load (guarded with try/catch).
- **`ProtectedRoute`**: redirects unauthenticated users to `/login`; shows a loading state until the session is restored.
- **UI components**: small, reusable, no business logic.

## Data flow

1. Login: `POST /login` returns `{ token, user }`. Store token and user, redirect to `/dashboard`.
2. Protected pages call `GET /student-profile` through `api.js`.
3. Profile save sends `PUT /student-profile`, then refetches.
4. Forgot password: each step calls its endpoint; the email carries through the steps in component state.

## Error handling

- Show the backend `message` as a toast.
- HTTP 429 shows "Too many attempts. Please try again later." (backend rate-limits `/login`, `/forgotpassword`, `/verifyforgototp`, `/resetpassword` to 10 per 15 minutes).
- Client-side validation before submit: required fields, email format, minimum password length, percentage 0–100 on academic fields.
- Network failure shows a generic "Cannot reach server" message.

## Security notes

- Token in `localStorage` is readable by XSS; keep all user content rendered as text, no `dangerouslySetInnerHTML`.
- Backend CORS defaults to `http://localhost:5173`; `CORS_ORIGIN` must include the Next.js dev origin (`http://localhost:3001` or wherever it runs).
- Profile image: client checks type (JPG/PNG) and size (5 MB) before upload; backend also verifies magic bytes.

## Testing

Manual: signup, login, wrong password, rate limit, forgot-password full flow, profile save and reload, image upload, protected-route redirect, logout.

## Open items for planning

- Read exact request/response fields for profile save and image upload from `BACKEND/CONTROLLERS/ProfileController.js`.

Decision: Next.js dev server runs on port 3001 (`next dev -p 3001`), since the backend uses 3000.
