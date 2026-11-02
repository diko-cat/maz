import { statusLabels } from "./format.ts";
import type { DashboardFilters, DashboardSelection, Doctor, HospitalData } from "./types";

function normalize(value: string): string {
  return value.toLocaleLowerCase("ru");
}

export function selectDashboard(
  data: HospitalData,
  doctors: Doctor[],
  today: string,
  filters: DashboardFilters,
): DashboardSelection {
  const needle = normalize(filters.query.trim());
  const matches = (...values: string[]) => normalize(values.join(" ")).includes(needle);
  const patientNames = new Map(data.patients.map((patient) => [patient.id, patient.name]));
  const doctorNames = new Map(doctors.map((doctor) => [doctor.id, doctor.name]));

  const filteredPatients = data.patients
    .filter((patient) => (
      matches(patient.name, patient.phone, patient.email)
      && (!filters.gender || patient.gender === filters.gender)
    ))
    .sort((first, second) => filters.sort === "registeredAt"
      ? second.registeredAt.localeCompare(first.registeredAt)
      : first.name.localeCompare(second.name, "ru"));

  const filteredDoctors = doctors.filter((doctor) => matches(doctor.name, doctor.specialty));
  const filteredAppointments = data.appointments
    .filter((appointment) => matches(
      patientNames.get(appointment.patientId) ?? "",
      doctorNames.get(appointment.doctorId) ?? "",
      appointment.date,
      appointment.time,
      statusLabels[appointment.status],
    ))
    .sort((first, second) => (
      `${first.date} ${first.time}`.localeCompare(`${second.date} ${second.time}`)
    ));

  const activeAppointments = data.appointments.filter((appointment) => appointment.status !== "cancelled");
  const stats: DashboardSelection["stats"] = [
    {
      kind: "patients",
      label: "Всего пациентов",
      value: data.patients.length,
      detail: "Зарегистрировано в клинике",
    },
    {
      kind: "doctors",
      label: "Врачи",
      value: doctors.length,
      detail: `${doctors.filter((doctor) => doctor.available).length} специалиста ведут приём`,
    },
    {
      kind: "appointments",
      label: "Записи на приём",
      value: activeAppointments.length,
      detail: "Без отменённых записей",
    },
    {
      kind: "today",
      label: "Приёмы сегодня",
      value: activeAppointments.filter((appointment) => appointment.date === today).length,
      detail: "По расписанию на сегодня",
    },
  ];

  return { filteredPatients, filteredDoctors, filteredAppointments, stats };
}
