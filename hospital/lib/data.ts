import type { Appointment, Doctor, Patient } from "./types";

export type PatientDraft = Pick<Patient, "name" | "birthDate" | "gender" | "phone" | "email">;
type PatientErrors = Partial<Record<keyof PatientDraft, string>>;

const patterns = {
  date: /^\d{4}-\d{2}-\d{2}$/,
  phone: /^\+?[\d\s()-]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  appointmentTime: /^(0[89]|1[0-7]):(00|30)$/,
};

const patientMessages = {
  name: "Укажите фамилию и имя.",
  birthDate: "Укажите дату рождения от 1900 года до сегодняшнего дня.",
  phone: "Введите телефон: от 10 до 15 цифр.",
  email: "Проверьте адрес электронной почты.",
};

const appointmentMessages = {
  date: "Выберите сегодняшнюю или будущую дату.",
  time: "Выберите время с 08:00 до 17:30 с шагом 30 минут.",
  doctor: "Врач уже занят в это время. Выберите другое время.",
  patient: "У пациента уже есть запись на это время.",
};

export const seedPatients: Patient[] = [
  {
    id: "P-1001",
    name: "Алия Нурланова",
    birthDate: "1994-06-12",
    gender: "female",
    phone: "+7 701 123 45 67",
    email: "aliya@example.com",
    registeredAt: "2026-10-20",
  },
  {
    id: "P-1002",
    name: "Данияр Сейтов",
    birthDate: "1986-02-24",
    gender: "male",
    phone: "+7 702 234 56 78",
    email: "daniyar@example.com",
    registeredAt: "2026-10-22",
  },
  {
    id: "P-1003",
    name: "Мария Ким",
    birthDate: "2001-09-08",
    gender: "female",
    phone: "+7 705 345 67 89",
    email: "maria@example.com",
    registeredAt: "2026-10-23",
  },
  {
    id: "P-1004",
    name: "Арман Тулегенов",
    birthDate: "1978-11-15",
    gender: "male",
    phone: "+7 707 456 78 90",
    email: "arman@example.com",
    registeredAt: "2026-10-25",
  },
  {
    id: "P-1005",
    name: "София Ахметова",
    birthDate: "1998-03-19",
    gender: "female",
    phone: "+7 747 567 89 01",
    email: "sofia@example.com",
    registeredAt: "2026-10-28",
  },
  {
    id: "P-1006",
    name: "Тимур Оспанов",
    birthDate: "1990-07-02",
    gender: "male",
    phone: "+7 775 678 90 12",
    email: "timur@example.com",
    registeredAt: "2026-10-29",
  },
];

export const doctors: Doctor[] = [
  {
    id: "D-01",
    name: "Айгуль Садыкова",
    specialty: "Терапевт",
    room: "101",
    available: true,
  },
  {
    id: "D-02",
    name: "Руслан Касымов",
    specialty: "Кардиолог",
    room: "204",
    available: true,
  },
  {
    id: "D-03",
    name: "Елена Пак",
    specialty: "Невролог",
    room: "208",
    available: true,
  },
  {
    id: "D-04",
    name: "Бекзат Алиев",
    specialty: "Хирург",
    room: "305",
    available: false,
  },
];

const appointmentSchedule: Omit<Appointment, "date">[] = [
  {
    id: "A-001",
    patientId: "P-1001",
    doctorId: "D-01",
    time: "09:00",
    status: "completed",
  },
  {
    id: "A-002",
    patientId: "P-1002",
    doctorId: "D-02",
    time: "10:30",
    status: "confirmed",
  },
  {
    id: "A-003",
    patientId: "P-1003",
    doctorId: "D-03",
    time: "11:00",
    status: "confirmed",
  },
  {
    id: "A-004",
    patientId: "P-1004",
    doctorId: "D-01",
    time: "12:00",
    status: "pending",
  },
  {
    id: "A-005",
    patientId: "P-1005",
    doctorId: "D-02",
    time: "14:30",
    status: "confirmed",
  },
];

export function seedAppointments(today: string): Appointment[] {
  return appointmentSchedule.map((appointment) => ({ ...appointment, date: today }));
}

export function localDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return [year, month, day].join("-");
}

export function isDate(value: string): boolean {
  if (!patterns.date.test(value)) return false;

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return false;

  return new Date(timestamp).toISOString().slice(0, 10) === value;
}

function isBirthDateAllowed(value: string, today: string): boolean {
  return isDate(value) && value >= "1900-01-01" && value <= today;
}

function isPhoneValid(value: string): boolean {
  const phone = value.trim();
  const digitCount = phone.replace(/\D/g, "").length;
  return patterns.phone.test(phone) && digitCount >= 10 && digitCount <= 15;
}

function isEmailValid(value: string): boolean {
  return value === "" || patterns.email.test(value.trim());
}

export function validatePatient(draft: PatientDraft, today: string): PatientErrors {
  const errors: PatientErrors = {};

  if (draft.name.trim().split(/\s+/).length < 2) {
    errors.name = patientMessages.name;
  }
  if (!isBirthDateAllowed(draft.birthDate, today)) {
    errors.birthDate = patientMessages.birthDate;
  }
  if (!isPhoneValid(draft.phone)) {
    errors.phone = patientMessages.phone;
  }
  if (!isEmailValid(draft.email)) {
    errors.email = patientMessages.email;
  }

  return errors;
}

export function appointmentError(
  appointments: Appointment[],
  patientId: string,
  doctorId: string,
  date: string,
  time: string,
  today: string,
): string {
  if (!isDate(date) || date < today) {
    return appointmentMessages.date;
  }
  if (!patterns.appointmentTime.test(time)) {
    return appointmentMessages.time;
  }

  let patientHasAppointment = false;
  for (const appointment of appointments) {
    if (appointment.status === "cancelled" || appointment.date !== date || appointment.time !== time) {
      continue;
    }
    if (appointment.doctorId === doctorId) {
      return appointmentMessages.doctor;
    }
    if (appointment.patientId === patientId) {
      patientHasAppointment = true;
    }
  }

  return patientHasAppointment ? appointmentMessages.patient : "";
}
