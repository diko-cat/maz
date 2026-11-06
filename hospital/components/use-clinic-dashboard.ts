"use client";

import { useState, useSyncExternalStore } from "react";
import { doctors, type PatientDraft } from "@/lib/data";
import { updateHospital, useHospitalStore } from "@/lib/hospital-store";
import { selectDashboard } from "@/lib/selectors";
import type { Appointment, DashboardModel, Patient, Section } from "@/lib/types";
import { getProfileSnapshot, getServerProfileSnapshot, subscribeProfile, writeProfile } from "@/lib/profile-store";
import type { UserProfile } from "./clinic-shell";

function createId(prefix: "P" | "A"): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export function useClinicDashboard() {
  const store = useHospitalStore();
  const [section, setCurrentSection] = useState<Section>("overview");
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("");
  const [sort, setSort] = useState("name");
  const [editor, setEditor] = useState<Patient | "new" | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);
  const [appointmentEditor, setAppointmentEditor] = useState(false);
  const [help, setHelp] = useState(false);
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profile = useSyncExternalStore(subscribeProfile, getProfileSnapshot, getServerProfileSnapshot);

  function saveProfile(next: UserProfile) {
    setToast(writeProfile(next) ? "Профиль сохранён" : "Профиль обновлён до перезагрузки страницы");
  }

  function setSection(next: Section) {
    setCurrentSection(next);
    setQuery("");
    setSidebarOpen(false);
  }

  function savePatient(draft: PatientDraft) {
    if (!editor) return;

    const isNew = editor === "new";
    const patients: Patient[] = isNew
      ? [...store.patients, { ...draft, id: createId("P"), registeredAt: store.today }]
      : store.patients.map((patient) => patient.id === editor.id ? { ...patient, ...draft } : patient);

    updateHospital({ patients, appointments: store.appointments });
    setEditor(null);
    setToast(isNew ? "Пациент добавлен" : "Данные пациента обновлены");
  }

  function deletePatient() {
    if (!deleting) return;

    updateHospital({
      patients: store.patients.filter((patient) => patient.id !== deleting.id),
      appointments: store.appointments.filter((appointment) => appointment.patientId !== deleting.id),
    });
    setDeleting(null);
    setToast("Пациент и связанные записи удалены");
  }

  function saveAppointment(draft: Omit<Appointment, "id">) {
    updateHospital({
      patients: store.patients,
      appointments: [...store.appointments, { ...draft, id: createId("A") }],
    });
    setAppointmentEditor(false);
    setToast("Запись на приём создана");
  }

  function cancelAppointment(target: Appointment) {
    updateHospital({
      patients: store.patients,
      appointments: store.appointments.map((appointment) => (
        appointment.id === target.id ? { ...appointment, status: "cancelled" } : appointment
      )),
    });
    setToast("Запись отменена");
  }

  const model: DashboardModel = {
    ...selectDashboard(store, doctors, store.today, { query, gender, sort }),
    patients: store.patients,
    appointments: store.appointments,
    doctors,
    today: store.today,
    ready: store.ready,
    section,
    setSection,
    query,
    setQuery,
    gender,
    setGender,
    sort,
    setSort,
    onAddPatient: () => setEditor("new"),
    onEditPatient: setEditor,
    onDeletePatient: setDeleting,
    onAddAppointment: () => setAppointmentEditor(true),
    onCancelAppointment: cancelAppointment,
  };

  return {
    store,
    model,
    profile,
    saveProfile,
    editor,
    closePatientEditor: () => setEditor(null),
    savePatient,
    deleting,
    closeDeleteDialog: () => setDeleting(null),
    deletePatient,
    appointmentEditor,
    closeAppointmentEditor: () => setAppointmentEditor(false),
    saveAppointment,
    help,
    openHelp: () => setHelp(true),
    closeHelp: () => setHelp(false),
    toast,
    closeToast: () => setToast(""),
    sidebarOpen,
    toggleSidebar: () => setSidebarOpen((open) => !open),
    closeSidebar: () => setSidebarOpen(false),
  };
}
