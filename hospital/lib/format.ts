import type { Appointment, Locale } from "./types";

const localeTags: Record<Locale, string> = { kk: "kk-KZ", ru: "ru-RU", en: "en-US" };

export const statusLabels: Record<Appointment["status"], string> = {
  confirmed: "Подтверждена",
  pending: "Ожидает",
  completed: "Завершена",
  cancelled: "Отменена",
};

export function formatDate(value: string, locale: Locale = "ru"): string {
  return new Intl.DateTimeFormat(localeTags[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function initials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("");
}
