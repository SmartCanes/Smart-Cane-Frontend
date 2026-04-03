// API client: JWT on requests; 401/422 clears session and sends to /login.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function getToken() {
  return localStorage.getItem("access_token") || "";
}

function clearSession() {
  localStorage.clear();
  window.location.href = "/login";
}

async function request(method, endpoint, body = null) {
  const headers = {
    "Content-Type": "application/json",
    Authorization:  `Bearer ${getToken()}`,
  };

  const options = { method, headers };
  if (body !== null && body !== undefined) options.body = JSON.stringify(body);

  try {
    const res  = await fetch(`${API_URL}${endpoint}`, options);
    const data = await res.json();

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
  patch:  (endpoint, body)  => request("PATCH",  endpoint, body),
  delete: (endpoint, body)  => request("DELETE", endpoint, body),
};

export default api;