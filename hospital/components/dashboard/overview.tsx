import { CalendarDays, Clock3, HeartPulse, Plus, Stethoscope, Users } from "lucide-react";
import type { DashboardModel, Stat } from "@/lib/types";
import { AppointmentsSection } from "./appointments";
import { PatientsSection } from "./patients";
import { avatarColors, styles } from "./shared";

const statIcons = { patients: Users, doctors: Stethoscope, appointments: CalendarDays, today: Clock3 };

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const Icon = statIcons[stat.kind];
  return (
    <div className={`${styles.panel} p-5`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">{stat.label}</p>
        <span className={`rounded-lg p-2 ${avatarColors[index % avatarColors.length]}`}><Icon size={18} /></span>
      </div>
      <div className="text-3xl font-semibold tracking-tight text-slate-800">{stat.value}</div>
      <p className="mt-2 text-[11px] text-slate-400">{stat.detail}</p>
    </div>
  );
}

function WelcomeBanner({ onAddAppointment }: { onAddAppointment: () => void }) {
  return (
    <section className="relative flex items-center justify-between overflow-hidden rounded-2xl bg-[#e5f1ef] px-7 py-8 sm:px-9">
      <div className="relative z-10 max-w-lg">
        <p className="mb-3 text-[10px] font-bold tracking-[.18em] text-teal-700">ЗАБОТА НАЧИНАЕТСЯ С ПОРЯДКА</p>
        <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#204b47] sm:text-[28px]">Хороший день для заботы.</h2>
        <p className="mb-6 max-w-sm text-sm leading-relaxed text-[#61827e]">Пациенты, специалисты и расписание — всё, что нужно для работы вашей клиники.</p>
        <button type="button" className={styles.primary} onClick={onAddAppointment}><Plus size={16} />Записать на приём</button>
      </div>
      <div className="relative hidden size-44 shrink-0 items-center justify-center rounded-full border border-teal-700/10 bg-white/30 min-[950px]:flex">
        <span className="absolute -inset-6 rounded-full border border-teal-700/5" />
        <HeartPulse size={88} strokeWidth={1} className="text-teal-700/60" />
        <span className="absolute -bottom-1 rounded-full border border-white bg-white/90 px-4 py-2 text-[10px] font-medium tracking-wide text-teal-700">РЯДОМ С ПАЦИЕНТОМ</span>
      </div>
    </section>
  );
}

export function OverviewSection({ model }: { model: DashboardModel }) {
  return (
    <>
      <WelcomeBanner onAddAppointment={model.onAddAppointment} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {model.stats.map((stat, index) => <StatCard key={stat.kind} stat={stat} index={index} />)}
      </div>
      <AppointmentsSection model={model} overview />
      <PatientsSection model={model} overview />
    </>
  );
}
