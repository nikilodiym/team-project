import { apiRequest, storeAuth, clearAuth } from "./client";

// clearAuth before login avoids sending stale tokens

export async function login(email, password) {
  clearAuth();
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  storeAuth(data);
  return data;
}

export async function register(displayName, email, password) {
  clearAuth();
  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ displayName, email, password }),
  });
  storeAuth(data);
  return data;
}

export async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } catch {
    /* ignore if token expired */
  }
  clearAuth();
}

export async function getMe() {
  return apiRequest("/auth/me");
}
