// src/api/client.js
// ─────────────────────────────────────────────────────────
//  Shared API helper — automatically attaches the JWT token
//  to every request and handles token expiry globally.
// ─────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("access_token") || "";
}

function clearSession() {
  localStorage.clear();
  window.location.href = "/";   // redirect to login
}

async function request(method, endpoint, body = null) {
  const headers = {
    "Content-Type": "application/json",
    Authorization:  `Bearer ${getToken()}`,
  };

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const res  = await fetch(`${API_URL}${endpoint}`, options);
    const data = await res.json();

    // Token expired or invalid → kick user back to login
    if (res.status === 401 || res.status === 422) {
      clearSession();
      return null;
    }

    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { message: "Cannot reach the server." } };
  }
}

const api = {
  get:    (endpoint)        => request("GET",    endpoint),
  post:   (endpoint, body)  => request("POST",   endpoint, body),
  put:    (endpoint, body)  => request("PUT",    endpoint, body),
  delete: (endpoint)        => request("DELETE", endpoint),
};

export default api;