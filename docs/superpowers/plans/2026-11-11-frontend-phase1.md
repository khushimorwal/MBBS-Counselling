# Student Portal Frontend Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the student portal foundation in `FRONTEND/next.js`: signup, login, forgot-password (OTP), dashboard and profile with image upload, against the existing Express backend.

**Architecture:** Next.js App Router, all client-side data fetching through one axios instance. Auth state in a React context with the JWT in `localStorage`. Pure logic (validation, error messages, profile payload building) lives in small framework-free modules covered by `node --test`; pages stay thin.

**Tech Stack:** Next.js (App Router), JavaScript, Tailwind CSS 4, axios, react-toastify, Node built-in test runner.

**Source spec:** `docs/superpowers/specs/2026-11-11-frontend-phase1-design.md`

## Global Constraints

- **NO git commits or pushes.** The user said "dont push and commit anything". Leave all changes uncommitted. There are no commit steps in this plan.
- Language is JavaScript, not TypeScript.
- Backend base URL comes from `NEXT_PUBLIC_API_URL`. In a production build, a missing value must throw, never fall back to localhost. In development the fallback is `http://localhost:3000`.
- Dev server runs on port 3001 (`next dev -p 3001`); backend uses 3000.
- Token key in `localStorage` is `token`; user key is `user`. Every `localStorage` access is wrapped in try/catch.
- No `dangerouslySetInnerHTML` anywhere.
- Backend 429 shows exactly: `Too many attempts. Please try again later.`
- Password minimum length on the client: 8.
- Profile image client checks: JPG/PNG only, max 5 MB.
- Deviation from spec: all source lives under `src/` (`src/app`, `src/lib`, ...) because `create-next-app --src-dir` is used. Toasts use `react-toastify` (same as ADMIN) instead of a hand-written Toast component.
- Visual style matches the redesigned ADMIN panel: brand teal `#0F4C4A`, dark teal `#0B3534`, soft teal `#DDF0EC`, accent orange `#E4572E`, surface `#F4F7F6`, line `#DCE6E3`, fonts Bricolage Grotesque (display) and DM Sans (body). Primary buttons are orange (`bg-accent`), links and active states teal (`text-brand`). Task 1 defines these as Tailwind theme tokens so classes like `bg-brand`, `bg-accent`, `bg-surface`, `border-line`, `text-muted`, `font-display` work.
- Profile form scope in phase 1: personal details, 10th/12th/graduation academics, budget min/max. Location/course preferences and entrance exams wait for phases 2-3 (they need course and exam data).

## Backend API Reference (verified from source)

| Call | Body | Success response |
|---|---|---|
| `POST /login` | `{ email, password }` | `{ success, message, token, user: { id, name, email, roleId, role, permissions } }` |
| `POST /signup` | `{ name, email, password }` | 201 `{ success, message, user: { id, name, email, role } }` |
| `POST /forgotpassword` | `{ email }` | `{ success, message }` (emails 6-digit OTP, 5 min) |
| `POST /verifyforgototp` | `{ email, otp }` | `{ success, message }` |
| `POST /resetpassword` | `{ email, password }` | `{ success, message }` |
| `GET /student-profile` | (Bearer token) | `{ success, profile }`; `profile` is `null` if not created |
| `PUT /student-profile` | any of `dob, gender, city, state, country, academicDetails, budget` | `{ success, profile }` |
| `PUT /student-profile/profile-image` | multipart, field `profileImage` | `{ success, profileImage: { public_id, url } }` |

Errors return `{ success: false, message }`. Login/OTP endpoints return 429 after 10 attempts per 15 min.
`gender` enum: `male | female | other`. `academicDetails` shape: `tenth {board, percentage, passingYear}`, `twelfth {board, stream, percentage, passingYear}`, `graduation {college, course, percentage, passingYear}`. `budget {min, max}`.
Empty strings for Number fields cause a Mongoose CastError, so they must be dropped before sending.

## File Structure

```
FRONTEND/next.js/
  .env.example                       NEXT_PUBLIC_API_URL
  package.json                       scripts: dev (port 3001), test
  tests/
    validators.test.js
    errors.test.js
    profile.test.js
  src/
    lib/
      validators.js                  isEmail, minLength, isPercentage
      errors.js                      getErrorMessage(err)
      profile.js                     buildProfilePayload, profileToForm, profileCompleteness, emptyForm
      api.js                         axios instance + session storage helpers
    context/AuthContext.js           AuthProvider, useAuth
    components/
      FormField.js                   label + input + error
      Button.js                      button with loading state
      Navbar.js                      portal nav + logout
      ProtectedRoute.js              redirect guard
    app/
      layout.js                      root layout, AuthProvider, ToastContainer
      page.js                        redirect to /dashboard or /login
      (auth)/layout.js               centered card layout
      (auth)/login/page.js
      (auth)/signup/page.js
      (auth)/forgot-password/page.js
      (portal)/layout.js             ProtectedRoute + Navbar
      (portal)/dashboard/page.js
      (portal)/profile/page.js
```

---

### Task 1: Scaffold the Next.js project

**Files:**
- Create: `FRONTEND/next.js/` (scaffold), `FRONTEND/next.js/.env.example`, `FRONTEND/next.js/.env.local`
- Modify: `FRONTEND/next.js/package.json`

**Interfaces:**
- Produces: working `npm run dev` on port 3001, `npm test` script, alias `@/*` → `src/*`.

- [ ] **Step 1: Check the folder state**

`FRONTEND/next.js` currently contains only a placeholder entry from git. Run:

```bash
cd FRONTEND && ls -la next.js
```
Expected: empty directory (or just an empty file). If it is a regular file, delete it first: `rm FRONTEND/next.js`, then `mkdir FRONTEND/next.js`.

- [ ] **Step 2: Scaffold**

```bash
cd FRONTEND/next.js
npx create-next-app@latest . --js --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack --yes
```
Expected: project files created, `src/app/page.js` exists.

- [ ] **Step 3: Add dependencies**

```bash
npm install axios react-toastify
```

- [ ] **Step 4: Set scripts and module type**

Edit `package.json`: add `"type": "module"` at top level (if not already present), and set scripts to:

```json
"scripts": {
  "dev": "next dev -p 3001",
  "build": "next build",
  "start": "next start -p 3001",
  "lint": "next lint",
  "test": "node --test tests/"
}
```
Keep `lint` as whatever create-next-app generated if it differs (e.g. `eslint`).

- [ ] **Step 5: Env files**

`.env.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```
`.env.local` (same content; gitignored by the scaffold):
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

- [ ] **Step 5b: Add brand theme tokens**

Append to `src/app/globals.css` (after the `@import "tailwindcss";` line the scaffold generated):

```css
@theme inline {
  --color-brand: #0F4C4A;
  --color-brand-dark: #0B3534;
  --color-brand-soft: #DDF0EC;
  --color-accent: #E4572E;
  --color-surface: #F4F7F6;
  --color-line: #DCE6E3;
  --color-muted: #41524F;
  --font-display: "Bricolage Grotesque", sans-serif;
  --font-sans: "DM Sans", sans-serif;
}

body {
  font-family: var(--font-sans);
}
```

Load the two fonts in `src/app/layout.js` with `next/font/google` (`Bricolage_Grotesque` and `DM_Sans`) and apply their `className`s on `<body>`; or, if offline, link the Google Fonts stylesheet in `<head>`. Remove any dark-mode media query the scaffold added to `globals.css` that overrides body colors.

- [ ] **Step 6: Verify the scaffold runs**

```bash
npm run dev
```
Open `http://localhost:3001`. Expected: default Next.js page, no errors. Stop the server.

---

### Task 2: Pure logic modules with tests

**Files:**
- Create: `src/lib/validators.js`, `src/lib/errors.js`, `src/lib/profile.js`
- Test: `tests/validators.test.js`, `tests/errors.test.js`, `tests/profile.test.js`

**Interfaces:**
- Produces:
  - `isEmail(v: any): boolean`
  - `minLength(v: any, n: number): boolean`
  - `isPercentage(v: any): boolean` (empty/null counts as valid)
  - `getErrorMessage(err: any): string`
  - `emptyForm(): FormState`
  - `profileToForm(profile: object|null): FormState`
  - `buildProfilePayload(form: FormState): object`
  - `profileCompleteness(profile: object|null): number` (0-100 integer)
  - `FormState = { dob, gender, city, state, country, tenth:{board,percentage,passingYear}, twelfth:{board,stream,percentage,passingYear}, graduation:{college,course,percentage,passingYear}, budget:{min,max} }`, all leaf values strings.

- [ ] **Step 1: Write the failing tests**

`tests/validators.test.js`:
```js
import test from "node:test";
import assert from "node:assert/strict";
import { isEmail, minLength, isPercentage } from "../src/lib/validators.js";

test("isEmail accepts valid and rejects invalid", () => {
  assert.equal(isEmail("a@b.co"), true);
  assert.equal(isEmail(" a@b.co "), true);
  assert.equal(isEmail("a@b"), false);
  assert.equal(isEmail(""), false);
  assert.equal(isEmail(undefined), false);
});

test("minLength checks string length", () => {
  assert.equal(minLength("12345678", 8), true);
  assert.equal(minLength("1234567", 8), false);
  assert.equal(minLength(null, 8), false);
});

test("isPercentage allows empty and 0-100 only", () => {
  assert.equal(isPercentage(""), true);
  assert.equal(isPercentage(null), true);
  assert.equal(isPercentage("0"), true);
  assert.equal(isPercentage("100"), true);
  assert.equal(isPercentage("100.5"), false);
  assert.equal(isPercentage("-1"), false);
  assert.equal(isPercentage("abc"), false);
});
```

`tests/errors.test.js`:
```js
import test from "node:test";
import assert from "node:assert/strict";
import { getErrorMessage } from "../src/lib/errors.js";

test("429 gives rate limit message", () => {
  assert.equal(
    getErrorMessage({ response: { status: 429, data: { message: "x" } } }),
    "Too many attempts. Please try again later."
  );
});

test("backend message is used when present", () => {
  assert.equal(
    getErrorMessage({ response: { status: 401, data: { message: "Invalid email or password" } } }),
    "Invalid email or password"
  );
});

test("no response means network failure", () => {
  assert.equal(getErrorMessage(new Error("Network Error")), "Cannot reach server");
});

test("fallback message", () => {
  assert.equal(getErrorMessage({ response: { status: 500, data: {} } }), "Something went wrong");
});
```

`tests/profile.test.js`:
```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyForm,
  profileToForm,
  buildProfilePayload,
  profileCompleteness,
} from "../src/lib/profile.js";

test("emptyForm has all string leaves", () => {
  const f = emptyForm();
  assert.equal(f.dob, "");
  assert.equal(f.tenth.percentage, "");
  assert.equal(f.budget.max, "");
});

test("profileToForm handles null and maps values", () => {
  assert.deepEqual(profileToForm(null), emptyForm());
  const f = profileToForm({
    dob: "2005-04-10T00:00:00.000Z",
    gender: "male",
    city: "Delhi",
    academicDetails: { tenth: { percentage: 90, board: "CBSE" } },
    budget: { max: 1000000 },
  });
  assert.equal(f.dob, "2005-04-10");
  assert.equal(f.city, "Delhi");
  assert.equal(f.tenth.percentage, "90");
  assert.equal(f.tenth.board, "CBSE");
  assert.equal(f.budget.max, "1000000");
  assert.equal(f.twelfth.board, "");
});

test("buildProfilePayload drops empties and casts numbers", () => {
  const form = emptyForm();
  form.city = "Delhi";
  form.tenth.percentage = "90.5";
  form.tenth.passingYear = "2021";
  form.budget.max = "1500000";
  assert.deepEqual(buildProfilePayload(form), {
    city: "Delhi",
    academicDetails: { tenth: { percentage: 90.5, passingYear: 2021 } },
    budget: { max: 1500000 },
  });
});

test("buildProfilePayload returns empty object for empty form", () => {
  assert.deepEqual(buildProfilePayload(emptyForm()), {});
});

test("profileCompleteness", () => {
  assert.equal(profileCompleteness(null), 0);
  const full = {
    dob: "2005-04-10T00:00:00.000Z",
    gender: "male",
    city: "a",
    state: "b",
    country: "c",
    academicDetails: { tenth: { percentage: 90 }, twelfth: { percentage: 80 } },
    budget: { max: 1 },
  };
  assert.equal(profileCompleteness(full), 100);
  assert.equal(profileCompleteness({ city: "a", state: "b" }), 25);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL (modules not found: `Cannot find module .../src/lib/validators.js`).

- [ ] **Step 3: Implement the modules**

`src/lib/validators.js`:
```js
export const isEmail = (v) =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const minLength = (v, n) => typeof v === "string" && v.length >= n;

export const isPercentage = (v) => {
  if (v === "" || v === null || v === undefined) return true;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 100;
};
```

`src/lib/errors.js`:
```js
export function getErrorMessage(err) {
  const status = err?.response?.status;
  if (status === 429) return "Too many attempts. Please try again later.";
  const message = err?.response?.data?.message;
  if (message) return message;
  if (!err?.response) return "Cannot reach server";
  return "Something went wrong";
}
```

`src/lib/profile.js`:
```js
const isEmpty = (v) => v === "" || v === null || v === undefined;
const str = (v) => (isEmpty(v) ? undefined : v);
const num = (v) => (isEmpty(v) ? undefined : Number(v));
const toStr = (v) => (isEmpty(v) ? "" : String(v));

// Remove undefined keys and objects that end up empty.
const prune = (obj) => {
  const out = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v && typeof v === "object") {
      const child = prune(v);
      if (Object.keys(child).length) out[k] = child;
    } else if (v !== undefined) {
      out[k] = v;
    }
  });
  return out;
};

export const emptyForm = () => ({
  dob: "",
  gender: "",
  city: "",
  state: "",
  country: "",
  tenth: { board: "", percentage: "", passingYear: "" },
  twelfth: { board: "", stream: "", percentage: "", passingYear: "" },
  graduation: { college: "", course: "", percentage: "", passingYear: "" },
  budget: { min: "", max: "" },
});

export function profileToForm(profile) {
  const form = emptyForm();
  if (!profile) return form;
  form.dob = profile.dob ? String(profile.dob).slice(0, 10) : "";
  ["gender", "city", "state", "country"].forEach((k) => {
    form[k] = toStr(profile[k]);
  });
  const acad = profile.academicDetails || {};
  ["tenth", "twelfth", "graduation"].forEach((section) => {
    Object.keys(form[section]).forEach((k) => {
      form[section][k] = toStr(acad[section]?.[k]);
    });
  });
  form.budget.min = toStr(profile.budget?.min);
  form.budget.max = toStr(profile.budget?.max);
  return form;
}

export function buildProfilePayload(form) {
  return prune({
    dob: str(form.dob),
    gender: str(form.gender),
    city: str(form.city),
    state: str(form.state),
    country: str(form.country),
    academicDetails: {
      tenth: {
        board: str(form.tenth.board),
        percentage: num(form.tenth.percentage),
        passingYear: num(form.tenth.passingYear),
      },
      twelfth: {
        board: str(form.twelfth.board),
        stream: str(form.twelfth.stream),
        percentage: num(form.twelfth.percentage),
        passingYear: num(form.twelfth.passingYear),
      },
      graduation: {
        college: str(form.graduation.college),
        course: str(form.graduation.course),
        percentage: num(form.graduation.percentage),
        passingYear: num(form.graduation.passingYear),
      },
    },
    budget: {
      min: num(form.budget.min),
      max: num(form.budget.max),
    },
  });
}

export function profileCompleteness(profile) {
  if (!profile) return 0;
  const checks = [
    profile.dob,
    profile.gender,
    profile.city,
    profile.state,
    profile.country,
    profile.academicDetails?.tenth?.percentage,
    profile.academicDetails?.twelfth?.percentage,
    profile.budget?.max,
  ];
  const filled = checks.filter((v) => !isEmpty(v)).length;
  return Math.round((filled / checks.length) * 100);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all tests PASS.

---

### Task 3: API client and auth context

**Files:**
- Create: `src/lib/api.js`, `src/context/AuthContext.js`
- Modify: `src/app/layout.js`

**Interfaces:**
- Consumes: nothing from earlier tasks except `getErrorMessage` is used by pages, not here.
- Produces:
  - `api` (axios instance), `getToken(): string|null`, `getStoredUser(): object|null`, `saveSession(token, user): void`, `clearSession(): void` from `src/lib/api.js`
  - `AuthProvider` component and `useAuth(): { user, token, loading, login(email, password): Promise<void>, signup(name, email, password): Promise<void>, logout(): void }` from `src/context/AuthContext.js`. `login`/`signup` throw the axios error on failure.

- [ ] **Step 1: Write `src/lib/api.js`**

```js
import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000");

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_API_URL is required in production");
}

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // storage unavailable; session lasts until reload
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Only treat 401 as "session expired" when we actually sent a token;
    // a failed login also returns 401 and must not redirect.
    const hadToken = Boolean(error?.config?.headers?.Authorization);
    if (error?.response?.status === 401 && hadToken && typeof window !== "undefined") {
      clearSession();
      window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);
```

- [ ] **Step 2: Write `src/context/AuthContext.js`**

```js
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, clearSession, getStoredUser, getToken, saveSession } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session once on the client.
  useEffect(() => {
    setToken(getToken());
    setUser(getStoredUser());
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/login", { email, password });
    saveSession(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (name, email, password) => {
    await api.post("/signup", { name, email, password });
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, signup, logout }),
    [user, token, loading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
```

- [ ] **Step 3: Replace `src/app/layout.js`**

Keep the font imports the scaffold generated (if any), then:

```js
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "MBBS Counselling",
  description: "Student portal for MBBS counselling",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface text-brand-dark">
        <AuthProvider>{children}</AuthProvider>
        <ToastContainer position="top-right" autoClose={4000} />
      </body>
    </html>
  );
}
```
If the scaffold layout used font variables on `<body>`, keep those class names alongside the ones above.

- [ ] **Step 4: Verify build**

```bash
npm run build
```
Expected: build succeeds (the default scaffold page still exists).

---

### Task 4: UI components and login/signup pages

**Files:**
- Create: `src/components/FormField.js`, `src/components/Button.js`, `src/app/(auth)/layout.js`, `src/app/(auth)/login/page.js`, `src/app/(auth)/signup/page.js`
- Modify: `src/app/page.js`

**Interfaces:**
- Consumes: `useAuth()` (Task 3), `getErrorMessage` (Task 2), `isEmail`, `minLength` (Task 2).
- Produces:
  - `<FormField label name type value onChange error as? children? ...rest />` — renders `<input>` by default; `as="select"` renders `<select>` with `children` as options.
  - `<Button loading? ...rest>` — disabled while `loading`.

- [ ] **Step 1: `src/components/FormField.js`**

```js
export default function FormField({ label, name, error, as = "input", children, ...rest }) {
  const Tag = as;
  return (
    <div className="mb-4">
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-brand-dark">
        {label}
      </label>
      <Tag
        id={name}
        name={name}
        className={`w-full rounded-xl border bg-surface px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30 ${
          error ? "border-red-500" : "border-line"
        }`}
        {...rest}
      >
        {children}
      </Tag>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: `src/components/Button.js`**

```js
export default function Button({ loading = false, children, className = "", ...rest }) {
  return (
    <button
      disabled={loading || rest.disabled}
      className={`w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-[#cf4a24] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...rest}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
```

- [ ] **Step 3: `src/app/(auth)/layout.js`**

```js
export default function AuthLayout({ children }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6">{children}</div>
    </main>
  );
}
```

- [ ] **Step 4: `src/app/(auth)/login/page.js`**

```js
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/errors";
import { isEmail } from "@/lib/validators";
import FormField from "@/components/FormField";
import Button from "@/components/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!isEmail(form.email)) next.email = "Enter a valid email";
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      router.replace("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <h1 className="mb-6 text-2xl font-bold">Student Login</h1>
      <FormField label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
      <FormField label="Password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} />
      <Button type="submit" loading={loading}>Login</Button>
      <div className="mt-4 flex justify-between text-sm">
        <Link href="/forgot-password" className="text-brand">Forgot password?</Link>
        <Link href="/signup" className="text-brand">Create account</Link>
      </div>
    </form>
  );
}
```

- [ ] **Step 5: `src/app/(auth)/signup/page.js`**

```js
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/errors";
import { isEmail, minLength } from "@/lib/validators";
import FormField from "@/components/FormField";
import Button from "@/components/Button";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!isEmail(form.email)) next.email = "Enter a valid email";
    if (!minLength(form.password, 8)) next.password = "Password must be at least 8 characters";
    if (form.confirm !== form.password) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await signup(form.name.trim(), form.email.trim(), form.password);
      toast.success("Account created. Please log in.");
      router.replace("/login");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <h1 className="mb-6 text-2xl font-bold">Create Account</h1>
      <FormField label="Full name" name="name" value={form.name} onChange={onChange} error={errors.name} />
      <FormField label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
      <FormField label="Password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} />
      <FormField label="Confirm password" name="confirm" type="password" value={form.confirm} onChange={onChange} error={errors.confirm} />
      <Button type="submit" loading={loading}>Sign up</Button>
      <p className="mt-4 text-sm">
        Already registered? <Link href="/login" className="text-brand">Login</Link>
      </p>
    </form>
  );
}
```

- [ ] **Step 6: Replace `src/app/page.js` (root redirect)**

```js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(token ? "/dashboard" : "/login");
  }, [token, loading, router]);

  return null;
}
```

- [ ] **Step 7: Manual verification**

Backend running on :3000 (with `CORS_ORIGIN` including `http://localhost:3001`, see Task 8). `npm run dev`. Check:
1. `/` redirects to `/login`.
2. Submit empty login: inline errors show, no request sent.
3. Signup with a new email: toast "Account created", redirected to `/login`.
4. Login with that account: no redirect yet works only after Task 6 (dashboard); for now confirm the network call returns 200 and `token` appears in localStorage.
5. Wrong password: toast shows "Invalid email or password"; page does not reload.

---

### Task 5: Forgot password (3 steps)

**Files:**
- Create: `src/app/(auth)/forgot-password/page.js`

**Interfaces:**
- Consumes: `api` (Task 3), `getErrorMessage`, `isEmail`, `minLength` (Task 2), `FormField`, `Button` (Task 4).
- Produces: route `/forgot-password`.

- [ ] **Step 1: Write the page**

```js
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { isEmail, minLength } from "@/lib/validators";
import FormField from "@/components/FormField";
import Button from "@/components/Button";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 email, 2 otp, 3 new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async (fn) => {
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = (e) => {
    e.preventDefault();
    if (!isEmail(email)) return setError("Enter a valid email");
    setError("");
    run(async () => {
      await api.post("/forgotpassword", { email: email.trim() });
      toast.success("OTP sent to your email");
      setStep(2);
    });
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp.trim())) return setError("Enter the 6-digit OTP");
    setError("");
    run(async () => {
      await api.post("/verifyforgototp", { email: email.trim(), otp: otp.trim() });
      setStep(3);
    });
  };

  const resetPassword = (e) => {
    e.preventDefault();
    if (!minLength(password, 8)) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setError("");
    run(async () => {
      await api.post("/resetpassword", { email: email.trim(), password });
      toast.success("Password reset. Please log in.");
      router.replace("/login");
    });
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Reset Password</h1>

      {step === 1 && (
        <form onSubmit={sendOtp} noValidate>
          <FormField label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <Button type="submit" loading={loading}>Send OTP</Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verifyOtp} noValidate>
          <p className="mb-4 text-sm text-muted">OTP sent to {email}. It expires in 5 minutes.</p>
          <FormField label="OTP" name="otp" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} error={error} />
          <Button type="submit" loading={loading}>Verify OTP</Button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={resetPassword} noValidate>
          <FormField label="New password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <FormField label="Confirm password" name="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={error} />
          <Button type="submit" loading={loading}>Reset password</Button>
        </form>
      )}

      <p className="mt-4 text-sm">
        <Link href="/login" className="text-brand">Back to login</Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Manual verification**

1. Invalid email: inline error, no request.
2. Valid registered email: toast "OTP sent", step 2 shows. Check the inbox for the 6-digit OTP.
3. Wrong OTP: backend message toast, stays on step 2.
4. Correct OTP: step 3. Mismatched passwords: inline error. Matching: toast, redirect to `/login`, new password works.
5. Hit "Send OTP" more than 10 times in 15 min: toast "Too many attempts. Please try again later."

---

### Task 6: Portal layout, route guard and dashboard

**Files:**
- Create: `src/components/ProtectedRoute.js`, `src/components/Navbar.js`, `src/app/(portal)/layout.js`, `src/app/(portal)/dashboard/page.js`

**Interfaces:**
- Consumes: `useAuth` (Task 3), `api` (Task 3), `profileCompleteness` (Task 2), `getErrorMessage` (Task 2).
- Produces: route `/dashboard`; every page under `(portal)` is guarded.

- [ ] **Step 1: `src/components/ProtectedRoute.js`**

```js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) router.replace("/login");
  }, [loading, token, router]);

  if (loading || !token) {
    return <p className="p-8 text-center text-muted">Loading...</p>;
  }
  return children;
}
```

- [ ] **Step 2: `src/components/Navbar.js`**

```js
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const onLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <nav className="flex items-center justify-between border-b border-line bg-white px-6 py-3">
      <div className="flex items-center gap-6">
        <span className="font-display font-bold text-brand">MBBS Counselling</span>
        <Link href="/dashboard" className="text-sm hover:text-brand">Dashboard</Link>
        <Link href="/profile" className="text-sm hover:text-brand">Profile</Link>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span>{user?.name}</span>
        <button onClick={onLogout} className="rounded border px-3 py-1 hover:bg-gray-100">Logout</button>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: `src/app/(portal)/layout.js`**

```js
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

export default function PortalLayout({ children }) {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </ProtectedRoute>
  );
}
```

- [ ] **Step 4: `src/app/(portal)/dashboard/page.js`**

```js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/errors";
import { profileCompleteness } from "@/lib/profile";

export default function DashboardPage() {
  const { user } = useAuth();
  const [percent, setPercent] = useState(null);

  useEffect(() => {
    api
      .get("/student-profile")
      .then(({ data }) => setPercent(profileCompleteness(data.profile)))
      .catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Welcome, {user?.name}</h1>
      <p className="mb-6 text-muted">Complete your profile to get started.</p>

      <div className="rounded-2xl border border-line bg-white p-6">
        <div className="mb-2 flex justify-between text-sm">
          <span>Profile completeness</span>
          <span>{percent === null ? "..." : `${percent}%`}</span>
        </div>
        <div className="h-2 w-full rounded bg-gray-200">
          <div className="h-2 rounded bg-brand" style={{ width: `${percent ?? 0}%` }} />
        </div>
        <Link href="/profile" className="mt-4 inline-block text-sm text-brand">
          {percent === 100 ? "View profile" : "Complete profile"}
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Manual verification**

1. Logged out, open `/dashboard` directly: redirected to `/login`.
2. Log in: lands on `/dashboard` with name and a percentage.
3. Logout: back at `/login`; browser back does not show the dashboard.
4. In devtools, edit `token` in localStorage to garbage and reload `/dashboard`: API returns 401, you are redirected to `/login` and storage is cleared.

---

### Task 7: Profile page with image upload

**Files:**
- Create: `src/app/(portal)/profile/page.js`

**Interfaces:**
- Consumes: `api` (Task 3), `emptyForm`, `profileToForm`, `buildProfilePayload` (Task 2), `isPercentage` (Task 2), `getErrorMessage` (Task 2), `FormField`, `Button` (Task 4).
- Produces: route `/profile`.

- [ ] **Step 1: Write the page**

```js
"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { isPercentage } from "@/lib/validators";
import { buildProfilePayload, emptyForm, profileToForm } from "@/lib/profile";
import FormField from "@/components/FormField";
import Button from "@/components/Button";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png"];

function Section({ title, children }) {
  return (
    <section className="mb-6 rounded-2xl border border-line bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="grid gap-x-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function ProfilePage() {
  const [form, setForm] = useState(emptyForm());
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api
      .get("/student-profile")
      .then(({ data }) => {
        setForm(profileToForm(data.profile));
        setImageUrl(data.profile?.profileImage?.url || "");
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const setTop = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setNested = (section) => (e) =>
    setForm({ ...form, [section]: { ...form[section], [e.target.name]: e.target.value } });

  const validate = () => {
    const next = {};
    ["tenth", "twelfth", "graduation"].forEach((s) => {
      if (!isPercentage(form[s].percentage)) next[`${s}.percentage`] = "Enter 0 to 100";
    });
    const { min, max } = form.budget;
    if (min !== "" && max !== "" && Number(min) > Number(max)) {
      next["budget.max"] = "Max must be at least min";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const { data } = await api.put("/student-profile", buildProfilePayload(form));
      setForm(profileToForm(data.profile));
      toast.success("Profile saved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) return toast.error("Only JPG or PNG images are allowed");
    if (file.size > MAX_IMAGE_BYTES) return toast.error("Image must be 5 MB or smaller");

    const body = new FormData();
    body.append("profileImage", file);
    setUploading(true);
    try {
      const { data } = await api.put("/student-profile/profile-image", body);
      setImageUrl(data.profileImage.url);
      toast.success("Profile image updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p className="text-muted">Loading profile...</p>;

  return (
    <form onSubmit={onSave} noValidate>
      <h1 className="mb-6 text-2xl font-bold">My Profile</h1>

      <section className="mb-6 flex items-center gap-4 rounded-2xl border border-line bg-white p-6">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-xs text-muted">
            No image
          </div>
        )}
        <label className="cursor-pointer rounded border px-3 py-2 text-sm hover:bg-gray-100">
          {uploading ? "Uploading..." : "Change image"}
          <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={onImage} disabled={uploading} />
        </label>
      </section>

      <Section title="Personal details">
        <FormField label="Date of birth" name="dob" type="date" value={form.dob} onChange={setTop} />
        <FormField label="Gender" name="gender" as="select" value={form.gender} onChange={setTop}>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </FormField>
        <FormField label="City" name="city" value={form.city} onChange={setTop} />
        <FormField label="State" name="state" value={form.state} onChange={setTop} />
        <FormField label="Country" name="country" value={form.country} onChange={setTop} />
      </Section>

      <Section title="10th">
        <FormField label="Board" name="board" value={form.tenth.board} onChange={setNested("tenth")} />
        <FormField label="Percentage" name="percentage" type="number" step="0.01" value={form.tenth.percentage} onChange={setNested("tenth")} error={errors["tenth.percentage"]} />
        <FormField label="Passing year" name="passingYear" type="number" value={form.tenth.passingYear} onChange={setNested("tenth")} />
      </Section>

      <Section title="12th">
        <FormField label="Board" name="board" value={form.twelfth.board} onChange={setNested("twelfth")} />
        <FormField label="Stream" name="stream" value={form.twelfth.stream} onChange={setNested("twelfth")} />
        <FormField label="Percentage" name="percentage" type="number" step="0.01" value={form.twelfth.percentage} onChange={setNested("twelfth")} error={errors["twelfth.percentage"]} />
        <FormField label="Passing year" name="passingYear" type="number" value={form.twelfth.passingYear} onChange={setNested("twelfth")} />
      </Section>

      <Section title="Graduation (optional)">
        <FormField label="College" name="college" value={form.graduation.college} onChange={setNested("graduation")} />
        <FormField label="Course" name="course" value={form.graduation.course} onChange={setNested("graduation")} />
        <FormField label="Percentage" name="percentage" type="number" step="0.01" value={form.graduation.percentage} onChange={setNested("graduation")} error={errors["graduation.percentage"]} />
        <FormField label="Passing year" name="passingYear" type="number" value={form.graduation.passingYear} onChange={setNested("graduation")} />
      </Section>

      <Section title="Budget (INR per year)">
        <FormField label="Minimum" name="min" type="number" min="0" value={form.budget.min} onChange={setNested("budget")} />
        <FormField label="Maximum" name="max" type="number" min="0" value={form.budget.max} onChange={setNested("budget")} error={errors["budget.max"]} />
      </Section>

      <Button type="submit" loading={saving} className="sm:w-48">Save profile</Button>
    </form>
  );
}
```

Note: `id={name}` in `FormField` repeats across sections (`board`, `percentage`, ...). Duplicate DOM ids break label association. Fix in this task: give `FormField` an optional `id` prop and pass unique ids, e.g. `id="tenth-board"`. Change `FormField` signature to `({ label, name, id, error, ... })`, use `const inputId = id || name`, and set `htmlFor={inputId}` and `id={inputId}`. Then add `id="tenth-board"`, `id="tenth-percentage"`, `id="tenth-passingYear"`, `id="twelfth-board"`, etc. to every nested field above.

- [ ] **Step 2: Apply the `FormField` id fix**

Edit `src/components/FormField.js` as described in the note, and add the unique `id` props to the nested fields in `profile/page.js`.

- [ ] **Step 3: Manual verification**

1. New account: `/profile` loads with empty form, no error toast.
2. Fill city, 10th percentage 90.5, budget max 1500000; Save. Toast "Profile saved". Reload: values persist.
3. Enter percentage 150: inline error, no request.
4. Budget min 5, max 2: inline error on max.
5. Leave numeric fields blank and save: no CastError (empty values are dropped).
6. Upload a `.png` under 5 MB: avatar updates. Upload a `.gif` or an oversized file: toast, no request. Rename a text file to `.png` and upload: backend rejects with "File content does not match an allowed type" shown as toast.
7. Dashboard percentage rises after saving.

---

### Task 8: Backend CORS and final end-to-end check

**Files:**
- Modify: `BACKEND/.env` (local only, not tracked), `BACKEND/.env.example`

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Allow the Next.js origin**

In `BACKEND/.env.example` change the CORS line to:
```
CORS_ORIGIN=http://localhost:5173,http://localhost:3001
```
Add the same value to your local `BACKEND/.env`. Restart the backend.

- [ ] **Step 2: Full flow run-through**

With backend on :3000 and frontend on :3001, run the manual checks of Tasks 4-7 in one pass in a fresh incognito window: signup, login, dashboard, profile save, image upload, logout, forgot-password reset, login with new password.
Expected: no CORS errors in the browser console, no unhandled errors in either terminal.

- [ ] **Step 3: Tests and build**

```bash
cd FRONTEND/next.js && npm test && npm run build
```
Expected: all `node --test` tests pass; production build succeeds when `NEXT_PUBLIC_API_URL` is set. Also run `NODE_ENV=production npx next build` once with the variable unset to confirm it fails with `NEXT_PUBLIC_API_URL is required in production`.

- [ ] **Step 4: Leave changes uncommitted**

Do not commit or push. Report the final `git status` to the user.
