export type Section = "overview" | "patients" | "doctors" | "appointments";
export type Patient = {
  id: string;
  name: string;
  birthDate: string;
  gender: "female" | "male";
  phone: string;
  email: string;
  registeredAt: string;
};
export type Doctor = { id: string; name: string; specialty: string; room: string; available: boolean };
export type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
};
export type Stat = { label: string; value: number; detail: string; kind: "patients" | "doctors" | "appointments" | "today" };
export interface DashboardModel {
  section: Section;
  setSection: (section: Section) => void;
  query: string;
  setQuery: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  filteredPatients: Patient[];
  filteredDoctors: Doctor[];
  filteredAppointments: Appointment[];
  stats: Stat[];
  today: string;
  ready: boolean;
  onAddPatient: () => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
  onAddAppointment: () => void;
  onCancelAppointment: (appointment: Appointment) => void;
}
