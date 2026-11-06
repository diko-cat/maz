import { defaultProfile, type UserProfile } from "@/components/clinic-shell";

export const PROFILE_STORAGE_KEY = "medica-profile-v1";
let snapshot: UserProfile = defaultProfile;
let initialized = false;
const listeners = new Set<() => void>();

function notify() { listeners.forEach((listener) => listener()); }
function refresh() {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(PROFILE_STORAGE_KEY) ?? "null");
    if (value && typeof value === "object") {
      const candidate = value as Partial<UserProfile>;
      if (typeof candidate.name === "string" && typeof candidate.role === "string"
        && typeof candidate.email === "string" && typeof candidate.phone === "string") {
        snapshot = { name: candidate.name.slice(0, 80), role: candidate.role.slice(0, 60), email: candidate.email.slice(0, 120), phone: candidate.phone.slice(0, 30) };
      }
    }
  } catch { /* Keep the default profile when browser storage is unavailable or invalid. */ }
}
function onStorage(event: StorageEvent) {
  if (event.key !== PROFILE_STORAGE_KEY && event.key !== null) return;
  refresh();
  notify();
}
export function subscribeProfile(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  if (!initialized) {
    initialized = true;
    refresh();
    notify();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}
export const getProfileSnapshot = () => snapshot;
export const getServerProfileSnapshot = () => defaultProfile;
export function writeProfile(profile: UserProfile): boolean {
  snapshot = profile;
  let saved = true;
  try { window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile)); }
  catch { saved = false; }
  notify();
  return saved;
}
