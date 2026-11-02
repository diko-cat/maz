import { ArrowRight, CalendarPlus } from "lucide-react";
import { formatDate, statusLabels } from "@/lib/format";
import type { Appointment, DashboardModel } from "@/lib/types";
import { EmptyState, PanelHeading, SearchField, styles } from "./shared";

const statusColors: Record<Appointment["status"], string> = {
  confirmed: "bg-teal-50 text-teal-700",
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-slate-100 text-slate-500",
  cancelled: "bg-rose-50 text-rose-600",
};

function AppointmentRow({ appointment, model, overview }: {
  appointment: Appointment;
  model: DashboardModel;
  overview: boolean;
}) {
  const patient = model.patients.find((item) => item.id === appointment.patientId);
  const doctor = model.doctors.find((item) => item.id === appointment.doctorId);
  const canCancel = appointment.status === "confirmed" || appointment.status === "pending";

  return (
    <tr className="border-t border-slate-100">
      <td className="whitespace-nowrap px-6 py-4">
        <div className="font-semibold text-slate-700">{appointment.time}</div>
        {!overview && <div className="mt-1 text-xs text-slate-400">{formatDate(appointment.date)}</div>}
      </td>
      <td className="px-6 py-4 font-medium text-slate-700">{patient?.name}</td>
      <td className="px-6 py-4 text-slate-500">{doctor?.name}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${statusColors[appointment.status]}`}>
          {statusLabels[appointment.status]}
        </span>
      </td>
      {!overview && (
        <td className="px-6 py-4">
          {canCancel && (
            <button
              type="button"
              className="text-xs font-semibold text-rose-600 hover:underline"
              onClick={() => model.onCancelAppointment(appointment)}
              aria-label={`Отменить запись ${appointment.time} ${patient?.name}`}
            >
              Отменить
            </button>
          )}
        </td>
      )}
    </tr>
  );
}

export function AppointmentsSection({ model, overview = false }: { model: DashboardModel; overview?: boolean }) {
  const appointments = overview
    ? model.appointments.filter((item) => item.date === model.today && item.status !== "cancelled").sort((first, second) => first.time.localeCompare(second.time))
    : model.filteredAppointments;
  const columns = ["Время", "Пациент", "Врач", "Статус", ...(overview ? [] : ["Действия"])];

  return (
    <section className={styles.panel}>
      <PanelHeading
        title={overview ? "Приёмы сегодня" : "Расписание приёмов"}
        description={overview ? "План дня вашей клиники" : "Поиск по пациенту, врачу, дате и статусу"}
      >
        {overview ? (
          <button type="button" className={styles.link} onClick={() => model.setSection("appointments")}>
            Все записи <ArrowRight size={14} />
          </button>
        ) : (
          <button type="button" className={styles.primary} onClick={model.onAddAppointment}>
            <CalendarPlus size={16} />Записать на приём
          </button>
        )}
      </PanelHeading>
      {!overview && (
        <div className="flex border-b border-slate-100 p-4">
          <SearchField placeholder="Поиск записей" query={model.query} onQueryChange={model.setQuery} />
        </div>
      )}
      {appointments.length === 0 ? (
        <EmptyState>Записи не найдены. Создайте новую запись на приём.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50/80 text-xs text-slate-500">
              <tr>{columns.map((column) => <th key={column} scope="col" className="px-6 py-3 font-medium">{column}</th>)}</tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => <AppointmentRow key={appointment.id} appointment={appointment} model={model} overview={overview} />)}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
