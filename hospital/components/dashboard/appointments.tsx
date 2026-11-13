import { useState } from "react";
import { ArrowRight, CalendarPlus, Check } from "@/components/icons";
import { formatDate, statusLabels } from "@/lib/format";
import type { Appointment, DashboardModel } from "@/lib/types";
import { EmptyState, PanelHeading, SearchField, styles } from "./shared";
import { LocalizedContent } from "../locale-provider";

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
    <LocalizedContent><tr className="border-t border-slate-100 transition-colors hover:bg-slate-50">
      <td className="whitespace-nowrap px-6 py-4">
        <div className="font-mono text-base font-medium tabular-nums text-slate-800">{appointment.time}</div>
        {!overview && <div className="mt-1 text-xs text-slate-500">{formatDate(appointment.date, model.locale)}</div>}
      </td>
      <td className="px-6 py-4 font-medium text-slate-800">{patient?.name}</td>
      <td className="px-6 py-4 text-slate-600">{doctor?.name}<span className="mt-1 block text-xs text-slate-500">{doctor?.specialty} · Каб. {doctor?.room}</span></td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium before:size-1.5 before:rounded-full before:bg-current ${statusColors[appointment.status]}`}>
          {statusLabels[appointment.status]}
        </span>
      </td>
      {!overview && (
        <td className="px-6 py-4">
          {canCancel && <div className="flex items-center gap-2">
            {appointment.date <= model.today && <button type="button" title="Завершить приём" className="grid size-11 shrink-0 place-items-center rounded-lg text-teal-800 hover:bg-teal-50" aria-label={`Завершить приём ${appointment.time} ${patient?.name}`} onClick={() => model.onCompleteAppointment(appointment)}><Check /></button>}
            <button
              type="button"
              className="min-h-11 rounded-lg px-2 text-xs font-medium text-rose-700 hover:bg-rose-50"
              onClick={() => model.onCancelAppointment(appointment)}
              aria-label={`Отменить запись ${appointment.time} ${patient?.name}`}
            >
              Отменить
            </button>
          </div>}
        </td>
      )}
    </tr></LocalizedContent>
  );
}

export function AppointmentsSection({ model, overview = false }: { model: DashboardModel; overview?: boolean }) {
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const appointments = overview
    ? model.appointments.filter((item) => item.date === model.today && item.status !== "cancelled").sort((first, second) => first.time.localeCompare(second.time))
    : model.filteredAppointments.filter((item) => (!status || item.status === status) && (!date || item.date === date));
  const columns = ["Время", "Пациент", "Врач", "Статус", ...(overview ? [] : ["Действия"])];

  return (
    <LocalizedContent><section className={styles.panel}>
      <PanelHeading
        title={overview ? "Приёмы сегодня" : "Расписание приёмов"}
        description={overview ? "План дня вашей клиники" : "Поиск по пациенту, врачу, дате и статусу"}
      >
        {overview ? (
          <button type="button" className={styles.link} onClick={() => model.setSection("appointments")}>
            Все записи <ArrowRight size={14} />
          </button>
        ) : (
          <button type="button" className={styles.primary} onClick={() => model.onAddAppointment()}>
            <CalendarPlus size={16} />Записать на приём
          </button>
        )}
      </PanelHeading>
      {!overview && (
        <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4">
          <SearchField placeholder="Поиск записей" query={model.query} onQueryChange={model.setQuery} />
          <input type="date" name="appointmentDate" aria-label="Дата приёма" className={styles.field} value={date} onChange={(event) => setDate(event.target.value)} />
          <select aria-label="Статус записи" className={styles.field} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Все статусы</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <button type="button" className={styles.secondary} onClick={() => { setDate(""); setStatus(""); model.setQuery(""); }}>Сбросить</button>
        </div>
      )}
      {appointments.length === 0 ? (
        <EmptyState>Записи не найдены. Измените фильтры или создайте новую запись на приём.</EmptyState>
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
    </section></LocalizedContent>
  );
}
