const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5153/api";

const TOKEN_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "user";

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storeAuth(tokenData) {
  const accessToken = tokenData.accessToken ?? tokenData.AccessToken;
  const refreshToken = tokenData.refreshToken ?? tokenData.RefreshToken;
  const user = tokenData.user ?? tokenData.User;

  if (!accessToken) {
    throw new Error("Сервер не повернув токен авторизації");
  }

  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return false;

  const res = await fetch(`${API_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearAuth();
    return false;
  }

  const data = await res.json();
  storeAuth(data);
  return true;
}

export async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = { ...(options.headers || {}) };

  if (!isFormData) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Не вдалося підключитись до сервера. Перевірте, що backend запущено на " + API_URL
    );
  }

  if (response.status === 401 && localStorage.getItem(REFRESH_KEY)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${localStorage.getItem(TOKEN_KEY)}`;
      response = await fetch(`${API_URL}${path}`, { ...options, headers });
    }
  }

  if (!response.ok) {
    let message = "Request failed";
    try {
      const err = await response.json();
      message = err.message || err.title || message;
    } catch {
      /* ignore */
    }

    if (response.status === 401) {
      message = "Сесія закінчилась. Увійдіть знову.";
      clearAuth();
    } else if (response.status === 500) {
      message = "Помилка сервера. Перезапустіть backend.";
    } else if (response.status === 503) {
      message = message === "Request failed" ? "Сервіс тимчасово недоступний" : message;
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response;
}
