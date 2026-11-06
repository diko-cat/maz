import { initials } from "@/lib/format";
import { ArrowRight, Stethoscope } from "@/components/icons";
import type { DashboardModel, Doctor } from "@/lib/types";
import { avatarColors, EmptyState, SearchField, styles } from "./shared";

function DoctorCard({ doctor, index, onBook }: { doctor: Doctor; index: number; onBook: (doctorId: string) => void }) {
  return (
    <article className={`${styles.panel} p-6`}>
      <div className="mb-5 flex items-center gap-4">
        <div className={`flex size-14 items-center justify-center rounded-xl text-lg font-semibold ${avatarColors[index % avatarColors.length]}`}>
          {initials(doctor.name)}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-medium text-slate-800">{doctor.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{doctor.specialty}</p>
        </div>
      </div>
      <div className="mb-5 flex items-center gap-2 text-sm text-slate-500"><Stethoscope />{doctor.available ? "Доступен для записи на приём" : "Приём временно не ведётся"}</div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-500">Кабинет {doctor.room}</span>
        <span className={`rounded-md px-2.5 py-1 text-xs ${doctor.available ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
          {doctor.available ? "Ведёт приём" : "Нет приёма"}
        </span>
      </div>
      {doctor.available && <button type="button" className={`${styles.secondary} mt-5 w-full justify-between`} aria-label={`Записаться: ${doctor.name}`} onClick={() => onBook(doctor.id)}>Записать пациента<ArrowRight size={16} /></button>}
    </article>
  );
}

export function DoctorsSection({ model }: { model: DashboardModel }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-slate-800">Наши специалисты</h2>
          <p className="mt-1 text-sm text-slate-500">Специальности, кабинеты и доступность для записи</p>
        </div>
        <div className="w-full sm:w-80">
          <SearchField placeholder="Поиск по имени и специальности" query={model.query} onQueryChange={model.setQuery} />
        </div>
      </div>
      {model.filteredDoctors.length === 0 ? (
        <EmptyState>Врачи не найдены. Измените поисковый запрос.</EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {model.filteredDoctors.map((doctor, index) => <DoctorCard key={doctor.id} doctor={doctor} index={index} onBook={model.onAddAppointment} />)}
        </div>
      )}
    </>
  );
}
