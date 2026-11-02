"use client";

import type { DashboardModel } from "@/lib/types";
import { AppointmentsSection } from "./dashboard/appointments";
import { DoctorsSection } from "./dashboard/doctors";
import { OverviewSection } from "./dashboard/overview";
import { PatientsSection } from "./dashboard/patients";

export default function ClinicDashboard({ model }: { model: DashboardModel }) {
  return (
    <div className="space-y-6 font-sans">
      {model.section === "overview" && <OverviewSection model={model} />}
      {model.section === "patients" && <PatientsSection model={model} />}
      {model.section === "doctors" && <DoctorsSection model={model} />}
      {model.section === "appointments" && <AppointmentsSection model={model} />}
    </div>
  );
}
