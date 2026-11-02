import assert from "node:assert/strict";
import test from "node:test";
import { doctors, seedAppointments, seedPatients } from "./data.ts";
import { selectDashboard } from "./selectors.ts";

const today = "2026-11-02";
const filters = { query: "", gender: "", sort: "name" };

function createData() {
  return { patients: structuredClone(seedPatients), appointments: seedAppointments(today) };
}

test("patient search ignores case and whitespace and includes phone and email", () => {
  const data = createData();
  for (const query of ["  аЛиЯ  ", "701 123", "aliya@example.com"]) {
    const result = selectDashboard(data, doctors, today, { ...filters, query });
    assert.deepEqual(result.filteredPatients.map((patient) => patient.id), ["P-1001"]);
  }
});

test("patient gender and sort combine without mutating the source", () => {
  const data = createData();
  const before = structuredClone(data);
  const result = selectDashboard(data, doctors, today, { ...filters, gender: "female", sort: "registeredAt" });
  assert.deepEqual(result.filteredPatients.map((patient) => patient.id), ["P-1005", "P-1003", "P-1001"]);
  assert.deepEqual(data, before);
  assert.equal(selectDashboard(data, doctors, today, { ...filters, query: "несуществующий" }).filteredPatients.length, 0);
});

test("doctor and booking searches use names, specialities and translated statuses", () => {
  const data = createData();
  assert.deepEqual(
    selectDashboard(data, doctors, today, { ...filters, query: "кардиолог" }).filteredDoctors.map((doctor) => doctor.id),
    ["D-02"],
  );
  for (const [query, expected] of [
    ["Данияр", ["A-002"]],
    ["Руслан", ["A-002", "A-005"]],
    ["10:30", ["A-002"]],
  ]) {
    assert.deepEqual(
      selectDashboard(data, doctors, today, { ...filters, query }).filteredAppointments.map((appointment) => appointment.id),
      expected,
    );
  }
  assert.deepEqual(
    selectDashboard(data, doctors, today, { ...filters, query: "ожидает" }).filteredAppointments.map((appointment) => appointment.id),
    ["A-004"],
  );
});

test("appointments sort by date then time and counters exclude cancelled bookings", () => {
  const data = createData();
  data.appointments[0].status = "cancelled";
  data.appointments.push({ ...data.appointments[1], id: "tomorrow", date: "2026-11-03", time: "08:00" });
  data.appointments.reverse();
  const before = structuredClone(data);
  const result = selectDashboard(data, doctors, today, filters);
  assert.deepEqual(result.filteredAppointments.map((appointment) => appointment.id), ["A-001", "A-002", "A-003", "A-004", "A-005", "tomorrow"]);
  assert.deepEqual(result.stats.map(({ kind, value }) => ({ kind, value })), [
    { kind: "patients", value: 6 },
    { kind: "doctors", value: 4 },
    { kind: "appointments", value: 5 },
    { kind: "today", value: 4 },
  ]);
  assert.deepEqual(data, before);
});

test("empty data returns empty results and zero counters", () => {
  const result = selectDashboard({ patients: [], appointments: [] }, [], today, filters);
  assert.deepEqual(result.filteredPatients, []);
  assert.deepEqual(result.filteredDoctors, []);
  assert.deepEqual(result.filteredAppointments, []);
  assert.ok(result.stats.every((stat) => stat.value === 0));
});
