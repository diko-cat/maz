"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { doctors, type PatientDraft } from "@/lib/data";
import { updateHospital, useHospitalStore } from "@/lib/hospital-store";
import { selectDashboard } from "@/lib/selectors";
import type { Appointment, DashboardModel, Patient, Section } from "@/lib/types";
import { useLocale } from "./locale-provider";
import { getProfileSnapshot, getServerProfileSnapshot, subscribeProfile, writeProfile } from "@/lib/profile-store";
import type { UserProfile } from "./clinic-shell";

function createId(prefix: "P" | "A"): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export function useClinicDashboard() {
  const store = useHospitalStore();
  const { locale } = useLocale();
  const [section, setCurrentSection] = useState<Section>("overview");
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("");
  const [sort, setSort] = useState("name");
  const [editor, setEditor] = useState<Patient | "new" | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);
  const [appointmentEditor, setAppointmentEditor] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>();
  const [cancelling, setCancelling] = useState<Appointment | null>(null);
  const [help, setHelp] = useState(false);
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profile = useSyncExternalStore(subscribeProfile, getProfileSnapshot, getServerProfileSnapshot);

  function saveProfile(next: UserProfile) {
    setToast(writeProfile(next) ? "Профиль сохранён" : "Профиль обновлён до перезагрузки страницы");
  }

  useEffect(() => {
    if (!sidebarOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !event.defaultPrevented) setSidebarOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  function setSection(next: Section) {
    setCurrentSection(next);
    setQuery("");
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
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
    setCancelling(null);
  }

  function completeAppointment(target: Appointment) {
    updateHospital({
      patients: store.patients,
      appointments: store.appointments.map((appointment) => appointment.id === target.id
        ? { ...appointment, status: "completed" } : appointment),
    });
    setToast("Приём завершён");
  }

  const model: DashboardModel = {
    locale,
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
    onAddAppointment: (doctorId) => {
      setSelectedDoctorId(doctorId);
      setAppointmentEditor(true);
    },
    onCancelAppointment: setCancelling,
    onCompleteAppointment: completeAppointment,
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
    selectedDoctorId,
    cancelling,
    closeCancelDialog: () => setCancelling(null),
    confirmCancelAppointment: () => { if (cancelling) cancelAppointment(cancelling); },
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
