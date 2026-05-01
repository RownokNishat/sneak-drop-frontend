import { ADMIN_USERNAME, ADMIN_EMAIL, STORAGE_KEY } from "./constants";

export function isAdmin(user) {
  return user?.username === ADMIN_USERNAME && user?.email === ADMIN_EMAIL;
}

export function loadUser() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
}
