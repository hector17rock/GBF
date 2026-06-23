export function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function safeReadLocalStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? fallback : raw;
  } catch {
    return fallback;
  }
}

export function safeWriteLocalStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}
