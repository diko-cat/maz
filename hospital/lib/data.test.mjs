import assert from "node:assert/strict";
import test from "node:test";
import { appointmentError, isDate, seedAppointments, validatePatient } from "./data.ts";

const today = "2026-10-30";
const valid = { name: "Тестовый Пациент", birthDate: "1995-02-28", gender: "male", phone: "+7 (701) 123-45-67", email: "demo@example.com" };

test("patient validation accepts optional email and rejects missing or malformed data", () => {
  assert.deepEqual(validatePatient(valid, today), {});
  assert.deepEqual(validatePatient({ ...valid, email: "" }, today), {});
  const errors = validatePatient({ ...valid, name: " ", phone: "123", email: "bad@", birthDate: "2027-01-01" }, today);
  assert.deepEqual(Object.keys(errors).sort(), ["birthDate", "email", "name", "phone"]);
});
test("birth dates reject nonexistent dates and correctly handle leap years", () => {
  assert.equal(isDate("2025-02-29"), false);
  assert.equal(isDate("2024-02-29"), true);
  assert.equal(isDate("2026-04-31"), false);
  assert.ok(validatePatient({ ...valid, birthDate: "1899-12-31" }, today).birthDate);
});
test("booking rejects doctor and patient double booking but allows adjacent slots", () => {
  const appointments = seedAppointments(today);
  assert.match(appointmentError(appointments, "P-1003", "D-02", today, "10:30", today), /Врач уже занят/);
  assert.match(appointmentError(appointments, "P-1002", "D-01", today, "10:30", today), /У пациента уже есть запись/);
  assert.equal(appointmentError(appointments, "P-1003", "D-02", today, "10:00", today), "");
});
test("cancelled slots can be reused; past dates, invalid times and impossible dates rejected", () => {
  const appointments = seedAppointments(today).map((a) => ({ ...a, status: "cancelled" }));
  assert.equal(appointmentError(appointments, "P-1002", "D-02", today, "10:30", today), "");
  assert.match(appointmentError([], "P-1002", "D-02", "2026-10-29", "10:30", today), /дату/);
  assert.match(appointmentError([], "P-1002", "D-02", today, "10:15", today), /Время|время/);
  assert.match(appointmentError([], "P-1002", "D-02", "2027-02-29", "10:30", today), /дату/);
});
