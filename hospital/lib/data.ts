import type { Appointment, Doctor, Patient } from "./types";

export const seedPatients: Patient[] = [
  { id: "P-1001", name: "Алия Нурланова", birthDate: "1994-06-12", gender: "female", phone: "+7 701 123 45 67", email: "aliya@example.com", registeredAt: "2026-10-20" },
  { id: "P-1002", name: "Данияр Сейтов", birthDate: "1986-02-24", gender: "male", phone: "+7 702 234 56 78", email: "daniyar@example.com", registeredAt: "2026-10-22" },
  { id: "P-1003", name: "Мария Ким", birthDate: "2001-09-08", gender: "female", phone: "+7 705 345 67 89", email: "maria@example.com", registeredAt: "2026-10-23" },
  { id: "P-1004", name: "Арман Тулегенов", birthDate: "1978-11-15", gender: "male", phone: "+7 707 456 78 90", email: "arman@example.com", registeredAt: "2026-10-25" },
  { id: "P-1005", name: "София Ахметова", birthDate: "1998-03-19", gender: "female", phone: "+7 747 567 89 01", email: "sofia@example.com", registeredAt: "2026-10-28" },
  { id: "P-1006", name: "Тимур Оспанов", birthDate: "1990-07-02", gender: "male", phone: "+7 775 678 90 12", email: "timur@example.com", registeredAt: "2026-10-29" },
];

export const doctors: Doctor[] = [
  { id: "D-01", name: "Айгуль Садыкова", specialty: "Терапевт", room: "101", available: true },
  { id: "D-02", name: "Руслан Касымов", specialty: "Кардиолог", room: "204", available: true },
  { id: "D-03", name: "Елена Пак", specialty: "Невролог", room: "208", available: true },
  { id: "D-04", name: "Бекзат Алиев", specialty: "Хирург", room: "305", available: false },
];

export function seedAppointments(today: string): Appointment[] {
  return [
    { id: "A-001", patientId: "P-1001", doctorId: "D-01", date: today, time: "09:00", status: "completed" },
    { id: "A-002", patientId: "P-1002", doctorId: "D-02", date: today, time: "10:30", status: "confirmed" },
    { id: "A-003", patientId: "P-1003", doctorId: "D-03", date: today, time: "11:00", status: "confirmed" },
    { id: "A-004", patientId: "P-1004", doctorId: "D-01", date: today, time: "12:00", status: "pending" },
    { id: "A-005", patientId: "P-1005", doctorId: "D-02", date: today, time: "14:30", status: "confirmed" },
  ];
}

export function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export type PatientDraft = Pick<Patient, "name" | "birthDate" | "gender" | "phone" | "email">;
export function validatePatient(draft: PatientDraft, today: string): Partial<Record<keyof PatientDraft, string>> {
  const errors: Partial<Record<keyof PatientDraft, string>> = {};
  if (draft.name.trim().split(/\s+/).length < 2) errors.name = "Укажите фамилию и имя.";
  if (!isDate(draft.birthDate) || draft.birthDate > today || draft.birthDate < "1900-01-01") errors.birthDate = "Укажите дату рождения от 1900 года до сегодняшнего дня.";
  if (!/^\+?[\d\s()-]+$/.test(draft.phone.trim()) || draft.phone.replace(/\D/g, "").length < 10 || draft.phone.replace(/\D/g, "").length > 15) errors.phone = "Введите телефон: от 10 до 15 цифр.";
  if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) errors.email = "Проверьте адрес электронной почты.";
  return errors;
}

export function appointmentError(appointments: Appointment[], patientId: string, doctorId: string, date: string, time: string, today: string) {
  if (!isDate(date) || date < today) return "Выберите сегодняшнюю или будущую дату.";
  if (!/^(0[89]|1[0-7]):(00|30)$/.test(time)) return "Выберите время с 08:00 до 17:30 с шагом 30 минут.";
  const active = appointments.filter((item) => item.status !== "cancelled");
  if (active.some((item) => item.doctorId === doctorId && item.date === date && item.time === time)) return "Врач уже занят в это время. Выберите другое время.";
  if (active.some((item) => item.patientId === patientId && item.date === date && item.time === time)) return "У пациента уже есть запись на это время.";
  return "";
}
