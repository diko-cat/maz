import { doctors, isDate, seedAppointments, seedPatients } from "./data.ts";
import type { Appointment, HospitalData, HospitalSnapshot, Patient } from "./types";

export const HOSPITAL_STORAGE_KEY = "medica-demo-v1";

const storageWarnings = {
  invalidData: "Сохранённые данные повреждены. Загружен демонстрационный набор.",
  readFailed: "Хранилище браузера недоступно. Изменения сохраняются только до перезагрузки.",
  writeFailed: "Не удалось сохранить изменения в браузере. Они доступны до перезагрузки.",
};
const storedTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const appointmentStatuses = new Set<string>(["confirmed", "pending", "completed", "cancelled"]);

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "setItem">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isStoredPatient(value: unknown): value is Patient {
  if (!isRecord(value)) return false;

  return typeof value.id === "string"
    && typeof value.name === "string"
    && typeof value.phone === "string"
    && typeof value.email === "string"
    && typeof value.birthDate === "string"
    && isDate(value.birthDate)
    && typeof value.registeredAt === "string"
    && isDate(value.registeredAt)
    && (value.gender === "male" || value.gender === "female");
}

function hasUniqueIds(items: { id: string }[]): boolean {
  return new Set(items.map((item) => item.id)).size === items.length;
}

function isStoredAppointment(
  value: unknown,
  patientIds: Set<string>,
  doctorIds: Set<string>,
): value is Appointment {
  if (!isRecord(value)) return false;

  return typeof value.id === "string"
    && typeof value.patientId === "string"
    && patientIds.has(value.patientId)
    && typeof value.doctorId === "string"
    && doctorIds.has(value.doctorId)
    && typeof value.date === "string"
    && isDate(value.date)
    && typeof value.time === "string"
    && storedTimePattern.test(value.time)
    && typeof value.status === "string"
    && appointmentStatuses.has(value.status);
}

export function isHospitalData(value: unknown): value is HospitalData {
  if (!isRecord(value)) return false;
  const { patients, appointments } = value;
  if (!Array.isArray(patients) || !Array.isArray(appointments)) return false;
  if (!patients.every(isStoredPatient) || !hasUniqueIds(patients)) return false;

  const patientIds = new Set(patients.map((patient) => patient.id));
  const doctorIds = new Set(doctors.map((doctor) => doctor.id));
  if (!appointments.every((appointment) => isStoredAppointment(appointment, patientIds, doctorIds))) {
    return false;
  }
  return hasUniqueIds(appointments);
}

export function readHospitalStorage(
  today: string,
  getStorage: () => StorageReader,
): HospitalSnapshot {
  let data: HospitalData = { patients: seedPatients, appointments: seedAppointments(today) };
  let storageWarning = "";

  try {
    const raw = getStorage().getItem(HOSPITAL_STORAGE_KEY);
    if (raw) {
      const stored: unknown = JSON.parse(raw);
      if (isHospitalData(stored)) {
        data = stored;
      } else {
        storageWarning = storageWarnings.invalidData;
      }
    }
  } catch {
    storageWarning = storageWarnings.readFailed;
  }

  return { ...data, today, ready: true, storageWarning };
}

export function writeHospitalStorage(
  data: HospitalData,
  getStorage: () => StorageWriter,
): string {
  try {
    getStorage().setItem(HOSPITAL_STORAGE_KEY, JSON.stringify(data));
    return "";
  } catch {
    return storageWarnings.writeFailed;
  }
}
