import assert from "node:assert/strict";
import test from "node:test";
import { appointmentError, isDate, localDate, seedAppointments, validatePatient } from "./data.ts";

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

test("date parser requires calendar dates and localDate uses local calendar fields", () => {
  for (const value of ["", "2026-1-01", "2026-01-1", "2026-00-01", "2026-13-01", "2026-11-02T00:00:00Z"]) {
    assert.equal(isDate(value), false, value);
  }
  for (const value of ["0000-01-01", "0099-12-31", "2000-02-29", today]) {
    assert.equal(isDate(value), true, value);
  }
  const now = new Date();
  const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  assert.equal(localDate(), expected);
});

test("patient validation keeps date, phone and optional email boundaries", () => {
  for (const phone of ["1234567890", "123456789012345", "  +7 (701) 123-45-67  "]) {
    assert.equal(validatePatient({ ...valid, phone }, today).phone, undefined, phone);
  }
  for (const phone of ["123456789", "1234567890123456", "++77011234567", "7701abc234567", "7701+234567"]) {
    assert.ok(validatePatient({ ...valid, phone }, today).phone, phone);
  }
  assert.ok(validatePatient({ ...valid, email: "   " }, today).email);
  assert.equal(validatePatient({ ...valid, email: " demo@example.com " }, today).email, undefined);
  for (const birthDate of ["1900-01-01", today]) {
    assert.equal(validatePatient({ ...valid, birthDate }, today).birthDate, undefined);
  }
});

test("seed bookings are independent and doctor conflict takes priority regardless of order", () => {
  const first = seedAppointments(today);
  const second = seedAppointments("2026-11-02");
  assert.notStrictEqual(first, second);
  first.forEach((appointment, index) => assert.notStrictEqual(appointment, second[index]));
  first[0].time = "17:30";
  assert.equal(seedAppointments(today)[0].time, "09:00");

  const conflicts = [
    { ...second[0], patientId: "P-1001", doctorId: "D-02", time: "10:30" },
    { ...second[1], patientId: "P-1002", doctorId: "D-01", time: "10:30" },
  ];
  for (const appointments of [conflicts, [...conflicts].reverse()]) {
    assert.match(appointmentError(appointments, "P-1001", "D-01", "2026-11-02", "10:30", today), /Врач уже занят/);
  }
  for (const time of ["08:00", "17:30"]) {
    assert.equal(appointmentError([], "P-1001", "D-01", today, time, today), "");
  }
  for (const time of ["07:30", "18:00", "10:15"]) {
    assert.match(appointmentError([], "P-1001", "D-01", today, time, today), /время/);
  }
});
