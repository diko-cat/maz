"use client";

import { HeartPulse } from "lucide-react";
import { AppointmentEditor, PatientEditor } from "./clinic-dialogs";
import ClinicDashboard from "./clinic-dashboard";
import { ClinicHeader, ClinicSidebar, PageHeading } from "./clinic-shell";
import { AboutClinic, DeletePatientDialog, Notification } from "./clinic-notices";
import { useClinicDashboard } from "./use-clinic-dashboard";

export default function ClinicApp() {
  const clinic = useClinicDashboard();
  const { store, model } = clinic;

  return (
    <div className="min-h-screen">
      <a href="#main-content" className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-white px-4 py-3 text-sm text-teal-800 shadow-sm focus:translate-y-0">Перейти к содержимому</a>
      <ClinicSidebar
        section={model.section}
        patientCount={store.patients.length}
        open={clinic.sidebarOpen}
        onNavigate={model.setSection}
        onClose={clinic.closeSidebar}
        onHelp={clinic.openHelp}
        profile={clinic.profile}
      />
      <div className="min-h-screen md:ml-64">
        <ClinicHeader
          section={model.section}
          sidebarOpen={clinic.sidebarOpen}
          onToggleSidebar={clinic.toggleSidebar}
          profile={clinic.profile}
        />
        <main id="main-content" className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8" tabIndex={-1}>
          <PageHeading section={model.section} today={store.today} ready={store.ready} />
          {store.storageWarning && <p className="notice" role="status">{store.storageWarning}</p>}
          {store.ready ? <ClinicDashboard model={model} profile={clinic.profile} onSaveProfile={clinic.saveProfile} /> : (
            <div className="grid min-h-80 place-content-center justify-items-center gap-4 text-sm text-slate-500" role="status">
              <HeartPulse size={30} aria-hidden="true" />
              Загружаем данные клиники…
            </div>
          )}
          <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500">
            <span>© 2026 maz · Забота в каждом действии</span>
            <span>Демонстрационные данные</span>
          </footer>
        </main>
      </div>

      {clinic.editor && (
        <PatientEditor
          patient={clinic.editor}
          today={store.today}
          onSave={clinic.savePatient}
          onClose={clinic.closePatientEditor}
        />
      )}
      {clinic.appointmentEditor && (
        <AppointmentEditor
          patients={store.patients}
          appointments={store.appointments}
          today={store.today}
          onSave={clinic.saveAppointment}
          onClose={clinic.closeAppointmentEditor}
        />
      )}
      {clinic.deleting && (
        <DeletePatientDialog
          patient={clinic.deleting}
          onConfirm={clinic.deletePatient}
          onClose={clinic.closeDeleteDialog}
        />
      )}
      {clinic.help && <AboutClinic onClose={clinic.closeHelp} />}
      {clinic.toast && <Notification message={clinic.toast} onClose={clinic.closeToast} />}
    </div>
  );
}
