"use client";

import { useSyncExternalStore } from "react";
import { doctors, isDate, localDate, seedAppointments, seedPatients } from "./data";
import type { Appointment, Patient } from "./types";

const key = "medica-demo-v1";
type Snapshot = { patients: Patient[]; appointments: Appointment[]; today: string; ready: boolean; storageWarning: string };
const serverSnapshot: Snapshot = { patients: seedPatients, appointments: [], today: "", ready: false, storageWarning: "" };
let snapshot = serverSnapshot;
let initialized = false;
const listeners = new Set<() => void>();

function validData(data: unknown): data is Pick<Snapshot, "patients" | "appointments"> {
  if (!data || typeof data !== "object" || !("patients" in data) || !("appointments" in data)) return false;
  const { patients, appointments } = data;
  if (!Array.isArray(patients) || !Array.isArray(appointments)) return false;
  if (!patients.every((p) => p && typeof p.id === "string" && typeof p.name === "string" && typeof p.phone === "string" && typeof p.email === "string" && typeof p.birthDate === "string" && isDate(p.birthDate) && typeof p.registeredAt === "string" && isDate(p.registeredAt) && ["male", "female"].includes(p.gender))) return false;
  if (new Set(patients.map((p) => p.id)).size !== patients.length || new Set(appointments.map((a) => a?.id)).size !== appointments.length) return false;
  return appointments.every((a) => a && typeof a.id === "string" && patients.some((p) => p.id === a.patientId) && doctors.some((d) => d.id === a.doctorId) && typeof a.date === "string" && isDate(a.date) && typeof a.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(a.time) && ["confirmed", "pending", "completed", "cancelled"].includes(a.status));
}

function read() {
  const today = localDate();
  let data = { patients: seedPatients, appointments: seedAppointments(today) };
  let storageWarning = "";
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const stored: unknown = JSON.parse(raw);
      if (validData(stored)) data = stored;
      else storageWarning = "Сохранённые данные повреждены. Загружен демонстрационный набор.";
    }
  } catch {
    storageWarning = "Хранилище браузера недоступно. Изменения сохраняются только до перезагрузки.";
  }
  snapshot = { ...data, today, ready: true, storageWarning };
}

function emit() { listeners.forEach((listener) => listener()); }
function onStorage(event: StorageEvent) { if (event.key === key || event.key === null) { read(); emit(); } }
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  if (!initialized) { initialized = true; read(); emit(); }
  return () => { listeners.delete(listener); if (!listeners.size) window.removeEventListener("storage", onStorage); };
}

export function useHospitalStore() {
  return useSyncExternalStore(subscribe, () => snapshot, () => serverSnapshot);
}

export function updateHospital(data: Pick<Snapshot, "patients" | "appointments">) {
  let storageWarning = "";
  try { localStorage.setItem(key, JSON.stringify(data)); }
  catch { storageWarning = "Не удалось сохранить изменения в браузере. Они доступны до перезагрузки."; }
  snapshot = { ...snapshot, ...data, storageWarning };
  emit();
}
