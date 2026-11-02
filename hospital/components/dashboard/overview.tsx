import { Plus } from "lucide-react";
import type { DashboardModel, Stat } from "@/lib/types";
import { AppointmentsSection } from "./appointments";
import { PatientsSection } from "./patients";
import { styles } from "./shared";

function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="p-4 sm:p-6">
      <p className="text-sm text-slate-600">{stat.label}</p>
      <div className={`my-3 text-3xl sm:text-4xl font-medium tracking-tight tabular-nums ${stat.kind === "today" ? "text-teal-800" : "text-slate-900"}`}>{stat.value}</div>
      <p className="text-xs leading-relaxed text-slate-500">{stat.detail}</p>
    </div>
  );
}

function WelcomeBanner({ onAddAppointment }: { onAddAppointment: () => void }) {
  return (
    <section className="flex flex-col justify-between gap-6 rounded-2xl border border-teal-900/10 bg-teal-50 px-6 py-6 sm:px-8 lg:flex-row lg:items-center">
      <div className="max-w-lg">
        <p className="mb-2 text-xs font-medium text-teal-800">Регистратура maz</p>
        <h2 className="text-xl font-medium tracking-tight text-slate-900 sm:text-2xl">Забота начинается с порядка</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">Пациенты, специалисты и расписание — всё для работы клиники</p>
      </div>
      <button type="button" className={`${styles.primary} shrink-0 self-start lg:self-center`} onClick={onAddAppointment}><Plus size={18} strokeWidth={1.5} />Записать на приём</button>
    </section>
  );
}

export function OverviewSection({ model }: { model: DashboardModel }) {
  return (
    <>
      <WelcomeBanner onAddAppointment={model.onAddAppointment} />
      <div className={`${styles.panel} grid grid-cols-2 [&>div]:border-slate-200 [&>div:nth-child(even)]:border-l [&>div:nth-child(n+3)]:border-t xl:grid-cols-4 xl:[&>div+div]:border-l xl:[&>div:nth-child(n+3)]:border-t-0`}>
        {model.stats.map((stat) => <StatCard key={stat.kind} stat={stat} />)}
      </div>
      <AppointmentsSection model={model} overview />
      <PatientsSection model={model} overview />
    </>
  );
}
