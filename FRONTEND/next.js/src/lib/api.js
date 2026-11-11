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
    // Only treat 401 as session expiry when a token was sent;
    // a failed login also returns 401 and must not redirect.
    const hadToken = Boolean(error?.config?.headers?.Authorization);
    if (error?.response?.status === 401 && hadToken && typeof window !== "undefined") {
      clearSession();
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- outside React; full reload also resets state
      window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);
