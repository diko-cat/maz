import assert from "node:assert/strict";
import test from "node:test";
import { seedAppointments, seedPatients } from "./data.ts";
import { HOSPITAL_STORAGE_KEY, isHospitalData, readHospitalStorage, writeHospitalStorage } from "./storage.ts";

const today = "2026-11-02";
const makeData = () => structuredClone({ patients: seedPatients, appointments: seedAppointments(today) });
const readerFor = (value) => () => ({ getItem: () => value });

test("saved patients and appointments remain compatible with the existing storage key", () => {
  const data = makeData();
  data.patients[0].name = "Сохранённый Пациент";
  let savedKey;
  const snapshot = readHospitalStorage(today, () => ({
    getItem(key) {
      savedKey = key;
      return JSON.stringify(data);
    },
  }));

  assert.equal(savedKey, "medica-demo-v1");
  assert.equal(HOSPITAL_STORAGE_KEY, savedKey);
  assert.deepEqual(snapshot, { ...data, today, ready: true, storageWarning: "" });
  assert.deepEqual(readHospitalStorage(today, readerFor('{"patients":[],"appointments":[]}')), {
    patients: [], appointments: [], today, ready: true, storageWarning: "",
  });
});

test("storage validation accepts historical dates and full-day times without applying booking rules", () => {
  const data = makeData();
  data.appointments[0].date = "2020-02-29";
  data.appointments[0].time = "23:59";
  assert.equal(isHospitalData(data), true);

  data.appointments[0].time = "00:00";
  assert.equal(isHospitalData(data), true);
});

test("storage validation rejects duplicate identifiers and broken patient or doctor references", () => {
  const duplicatePatients = makeData();
  duplicatePatients.patients[1].id = duplicatePatients.patients[0].id;
  assert.equal(isHospitalData(duplicatePatients), false);

  const duplicateAppointments = makeData();
  duplicateAppointments.appointments[1].id = duplicateAppointments.appointments[0].id;
  assert.equal(isHospitalData(duplicateAppointments), false);

  for (const field of ["patientId", "doctorId"]) {
    const data = makeData();
    data.appointments[0][field] = "missing";
    assert.equal(isHospitalData(data), false, field);
  }
});

test("storage validation rejects malformed records, impossible dates and invalid appointment values", () => {
  for (const value of [null, [], {}, { patients: [], appointments: null }, { patients: [null], appointments: [] }]) {
    assert.equal(isHospitalData(value), false);
  }

  const invalidPatients = [
    ["name", null], ["phone", 123], ["email", false], ["gender", "unknown"],
    ["birthDate", "2026-02-30"], ["registeredAt", "2026-13-01"],
  ];
  for (const [field, value] of invalidPatients) {
    const data = makeData();
    data.patients[0][field] = value;
    assert.equal(isHospitalData(data), false, field);
  }

  const invalidAppointments = [
    ["id", null], ["date", "2026-02-30"], ["time", "24:00"],
    ["time", "09:60"], ["status", "unknown"],
  ];
  for (const [field, value] of invalidAppointments) {
    const data = makeData();
    data.appointments[0][field] = value;
    assert.equal(isHospitalData(data), false, `${field}: ${value}`);
  }
});

test("missing or rejected saved data uses demo appointments for the current day", () => {
  const missing = readHospitalStorage(today, readerFor(null));
  assert.deepEqual(missing.patients, seedPatients);
  assert.deepEqual(missing.appointments, seedAppointments(today));
  assert.equal(missing.ready, true);
  assert.equal(missing.storageWarning, "");

  const invalid = readHospitalStorage(today, readerFor('{"patients":[],"appointments":[{}]}'));
  assert.deepEqual(invalid.appointments, seedAppointments(today));
  assert.match(invalid.storageWarning, /повреждены/);
});

test("unreadable storage and malformed JSON preserve a usable in-memory demo snapshot", () => {
  const unavailable = () => { throw new Error("Access denied"); };
  const failingReader = () => ({ getItem: unavailable });
  for (const getStorage of [unavailable, failingReader, readerFor("{broken")]) {
    const snapshot = readHospitalStorage(today, getStorage);
    assert.deepEqual(snapshot.appointments, seedAppointments(today));
    assert.equal(snapshot.ready, true);
    assert.match(snapshot.storageWarning, /недоступно/);
  }
});

test("saving writes the compatible payload and reports quota or access failures", () => {
  const data = makeData();
  let saved;
  const message = writeHospitalStorage(data, () => ({
    setItem(key, value) {
      saved = { key, value: JSON.parse(value) };
    },
  }));

  assert.equal(message, "");
  assert.deepEqual(saved, { key: "medica-demo-v1", value: data });
  const unavailable = () => { throw new Error("Access denied"); };
  const fullStorage = () => ({ setItem: () => { throw new Error("Quota exceeded"); } });
  for (const getStorage of [unavailable, fullStorage]) {
    assert.match(writeHospitalStorage(data, getStorage), /Не удалось сохранить/);
  }
});
