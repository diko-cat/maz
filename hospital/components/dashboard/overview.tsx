import { ArrowUpRight, Clock, Plus } from "@/components/icons";
import type { DashboardModel, Stat } from "@/lib/types";
import { AppointmentsSection } from "./appointments";
import { PatientsSection } from "./patients";
import { styles } from "./shared";
import { LocalizedContent } from "../locale-provider";

function StatCard({ stat, onClick }: { stat: Stat; onClick: () => void }) {
  return (
    <LocalizedContent><button type="button" onClick={onClick} className="group p-4 text-left transition-colors hover:bg-slate-50 sm:p-6">
      <span className="flex items-center justify-between gap-2 text-sm text-slate-600">{stat.label}<ArrowUpRight size={16} className="text-slate-400 group-hover:text-teal-700" /></span>
      <span className={`my-3 block text-3xl font-medium tracking-tight tabular-nums sm:text-4xl ${stat.kind === "today" ? "text-teal-800" : "text-slate-900"}`}>{stat.value}</span>
      <p className="text-xs leading-relaxed text-slate-500">{stat.detail}</p>
    </button></LocalizedContent>
  );
}

function WelcomeBanner({ model }: { model: DashboardModel }) {
  const today = model.appointments.filter((item) => item.date === model.today && item.status !== "cancelled");
  const completed = today.filter((item) => item.status === "completed").length;
  return (
    <LocalizedContent><section className="grid overflow-hidden rounded-2xl bg-teal-950 text-white lg:grid-cols-[1.15fr_1fr]">
      <div className="p-6 sm:p-8">
        <p className="mb-4 flex items-center gap-2 text-xs text-teal-200"><span className="size-1.5 rounded-full bg-teal-300" />Регистратура maz</p>
        <h2 className="max-w-sm text-2xl font-medium leading-tight tracking-tight sm:text-3xl">Внимание пациентам.<br />Порядок в расписании.</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-teal-100/80">Планируйте приёмы и находите нужные данные в одном рабочем пространстве</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-200 px-4 py-3 text-sm font-medium text-teal-950 transition-colors hover:bg-teal-100" onClick={() => model.onAddAppointment()}><Plus />Записать на приём</button>
          <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-3 text-sm text-white transition-colors hover:bg-white/10" onClick={model.onAddPatient}>Добавить пациента</button>
        </div>
      </div>
      <div className="flex flex-col justify-center border-t border-white/10 bg-white/5 p-6 sm:p-8 lg:border-t-0 lg:border-l">
        <div className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2 text-teal-100"><Clock />Рабочий день</span><span className="text-xs text-teal-200">08:00 — 18:00</span></div>
        <div className="my-6 grid grid-cols-10 gap-1.5" role="img" aria-label={`Часы с приёмами: ${[...new Set(today.map((item) => item.time.slice(0, 2)))].join(", ") || "нет записей"}`}>
          {Array.from({ length: 10 }, (_, index) => {
            const count = today.filter((item) => Number(item.time.slice(0, 2)) === index + 8).length;
            return <div key={index} title={`${index + 8}:00 — записей: ${count}`} className="flex flex-col justify-end gap-2"><div className={`flex h-14 items-end overflow-hidden rounded-md ${count ? "bg-teal-300/20" : "bg-white/5"}`}><div className={`w-full rounded-md ${count ? "h-full bg-teal-300" : "h-1 bg-white/15"}`} /></div><span className="text-center text-[11px] tabular-nums text-teal-100/70">{index + 8}</span></div>;
          })}
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-teal-100/80"><span>Завершено: {completed} из {today.length}</span><span>{model.doctors.filter((doctor) => doctor.available).length} врача ведут приём</span></div>
      </div>
    </section></LocalizedContent>
  );
}

export function OverviewSection({ model }: { model: DashboardModel }) {
  return (
    <>
      <WelcomeBanner model={model} />
      <div className={`${styles.panel} grid grid-cols-2 [&>button]:border-slate-200 [&>button:nth-child(even)]:border-l [&>button:nth-child(n+3)]:border-t xl:grid-cols-4 xl:[&>button+button]:border-l xl:[&>button:nth-child(n+3)]:border-t-0`}>
        {model.stats.map((stat) => <StatCard key={stat.kind} stat={stat} onClick={() => model.setSection(stat.kind === "today" ? "appointments" : stat.kind)} />)}
      </div>
      <AppointmentsSection model={model} overview />
      <PatientsSection model={model} overview />
    </>
  );
}
