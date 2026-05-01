import { API_URL } from "./constants";

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }

  return data;
}

export const api = {
  drops: {
    getAll: () => request("/api/drops"),
    create: (payload) =>
      request("/api/drops", { method: "POST", body: JSON.stringify(payload) }),
  },
  users: {
    register: (username, email) =>
      request("/api/users", {
        method: "POST",
        body: JSON.stringify({ username, email }),
      }),
  },
  reservations: {
    create: (userId, dropId) =>
      request("/api/reservations", {
        method: "POST",
        body: JSON.stringify({ userId, dropId }),
      }),
  },
  purchases: {
    create: (userId, dropId, reservationId) =>
      request("/api/purchases", {
        method: "POST",
        body: JSON.stringify({ userId, dropId, reservationId }),
      }),
  },
};
