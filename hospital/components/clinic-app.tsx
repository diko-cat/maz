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
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Перейти к содержимому</a>
      <ClinicSidebar
        section={model.section}
        patientCount={store.patients.length}
        open={clinic.sidebarOpen}
        onNavigate={model.setSection}
        onClose={clinic.closeSidebar}
        onHelp={clinic.openHelp}
      />
      <div className="app-workspace">
        <ClinicHeader
          section={model.section}
          sidebarOpen={clinic.sidebarOpen}
          onToggleSidebar={clinic.toggleSidebar}
        />
        <main id="main-content" className="app-main" tabIndex={-1}>
          <PageHeading section={model.section} today={store.today} ready={store.ready} />
          {store.storageWarning && <p className="notice" role="status">{store.storageWarning}</p>}
          {store.ready ? <ClinicDashboard model={model} /> : (
            <div className="loading-state" role="status">
              <HeartPulse size={30} aria-hidden="true" />
              Загружаем данные клиники…
            </div>
          )}
          <footer className="app-footer">
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
