export type Section = "overview" | "patients" | "doctors" | "appointments" | "profile";
export type Locale = "kk" | "ru" | "en";
export type PatientGender = "female" | "male";
export type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled";

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  gender: PatientGender;
  phone: string;
  email: string;
  registeredAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  room: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
}

export interface HospitalData {
  patients: Patient[];
  appointments: Appointment[];
}

export interface HospitalSnapshot extends HospitalData {
  today: string;
  ready: boolean;
  storageWarning: string;
}

export interface Stat {
  kind: "patients" | "doctors" | "appointments" | "today";
  label: string;
  value: number;
  detail: string;
}

export interface DashboardFilters {
  query: string;
  gender: string;
  sort: string;
}

export interface DashboardSelection {
  filteredPatients: Patient[];
  filteredDoctors: Doctor[];
  filteredAppointments: Appointment[];
  stats: Stat[];
}

export interface DashboardActions {
  setSection: (section: Section) => void;
  setQuery: (value: string) => void;
  setGender: (value: string) => void;
  setSort: (value: string) => void;
  onAddPatient: () => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
  onAddAppointment: (doctorId?: string) => void;
  onCancelAppointment: (appointment: Appointment) => void;
  onCompleteAppointment: (appointment: Appointment) => void;
}

export interface DashboardModel extends HospitalData, DashboardFilters, DashboardSelection, DashboardActions {
  locale: Locale;
  section: Section;
  doctors: Doctor[];
  today: string;
  ready: boolean;
}
