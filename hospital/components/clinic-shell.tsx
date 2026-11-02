import Link from "next/link";
import {
  Activity, ArrowUpRight, CalendarDays, CircleHelp, HeartPulse,
  LayoutDashboard, PanelLeftClose, PanelLeftOpen, Stethoscope, Users,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Section } from "@/lib/types";

const sections = {
  overview: { label: "Обзор", description: "Всё о работе клиники в одном месте", icon: LayoutDashboard },
  patients: { label: "Пациенты", description: "Информация о пациентах и история регистрации", icon: Users },
  doctors: { label: "Врачи", description: "Специалисты и кабинеты вашей клиники", icon: Stethoscope },
  appointments: { label: "Записи на приём", description: "Расписание и управление записями", icon: CalendarDays },
} satisfies Record<Section, { label: string; description: string; icon: typeof Users }>;

const sectionOrder: Section[] = ["overview", "patients", "doctors", "appointments"];

interface SidebarProps {
  section: Section;
  patientCount: number;
  open: boolean;
  onNavigate: (section: Section) => void;
  onClose: () => void;
  onHelp: () => void;
}

export function ClinicSidebar({ section, patientCount, open, onNavigate, onClose, onHelp }: SidebarProps) {
  return (
    <>
      {open && <button className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" aria-label="Закрыть меню" onClick={onClose} />}
      <aside id="app-sidebar" className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto border-r border-slate-200 bg-white p-5 transition-transform duration-200 motion-reduce:transition-none md:translate-x-0 ${open ? "translate-x-0 visible" : "-translate-x-full invisible md:visible"}`}>
        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-3xl font-semibold tracking-tight text-slate-900">
          <span className="grid size-10 place-items-center rounded-xl bg-teal-800 text-white"><HeartPulse size={25} strokeWidth={1.5} aria-hidden="true" /></span>
          <span>maz<span className="text-teal-700">.</span></span>
        </Link>
        <div className="mb-3 mt-10 px-3 text-xs font-medium text-slate-500">Управление клиникой</div>
        <nav aria-label="Основная навигация" className="flex flex-col gap-1">
          {sectionOrder.map((id) => {
            const { label, icon: Icon } = sections[id];
            return (
              <button
                key={id}
                className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors md:min-h-10 ${section === id ? "bg-teal-50 font-semibold text-teal-800 ring-1 ring-inset ring-teal-900/10" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                onClick={() => onNavigate(id)}
                aria-current={section === id ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                <span>{label}</span>
                {id === "patients" && <span className="ml-auto font-mono text-xs tabular-nums text-slate-500">{patientCount}</span>}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto px-3 pb-6 pt-16 text-xs leading-relaxed text-slate-500 [&_h2]:mb-2 [&_h2]:text-sm [&_h2]:font-medium [&_h2]:text-slate-800">
          <span className="mb-4 block text-teal-700"><Activity size={20} aria-hidden="true" /></span>
          <h2>Больше времени для людей</h2>
          <p>Пациенты и расписание — под рукой</p>
          <span className="mt-4 block text-xs text-slate-500"><span />Учебный проект</span>
        </div>
        <div className="border-t border-slate-200 pt-4">
          <button className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 [&_svg:last-child]:ml-auto" onClick={onHelp}>
            <CircleHelp size={18} aria-hidden="true" />
            О проекте
            <ArrowUpRight size={14} aria-hidden="true" />
          </button>
          <div className="mt-4 flex items-center gap-3 px-3 py-2 [&_strong]:block [&_strong]:text-sm [&_strong]:font-medium [&_small]:block [&_small]:text-xs [&_small]:text-slate-500">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-medium text-slate-700">ДК</span>
            <div><strong>Демо-клиника</strong><small>Администратор</small></div>
            <span className="ml-auto size-1.5 shrink-0 rounded-full bg-teal-700" title="Локальный режим" />
          </div>
        </div>
      </aside>
    </>
  );
}

interface HeaderProps {
  section: Section;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function ClinicHeader({ section, sidebarOpen, onToggleSidebar }: HeaderProps) {
  const MenuIcon = sidebarOpen ? PanelLeftClose : PanelLeftOpen;
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-3 text-sm text-slate-500 [&>span]:hidden lg:[&>span]:inline [&_strong]:truncate [&_strong]:font-medium [&_strong]:text-slate-800">
        <button
          className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
        >
          <MenuIcon size={21} aria-hidden="true" />
        </button>
        <span>Рабочее пространство</span>
        <span className="text-slate-300" aria-hidden="true">/</span>
        <strong>{sections[section].label}</strong>
      </div>
      <div className="flex shrink-0 items-center gap-5">
        <span className="hidden items-center gap-2 text-xs text-slate-500 before:size-1.5 before:rounded-full before:bg-teal-700 sm:flex">Локальный режим</span>
        <span className="grid size-8 place-items-center rounded-full border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">ДК</span>
      </div>
    </header>
  );
}

export function PageHeading({ section, today, ready }: { section: Section; today: string; ready: boolean }) {
  const { label, description } = sections[section];
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-slate-900 sm:[&_h1]:text-4xl">
      <div>
        <p className="mb-2 text-xs font-medium text-slate-500">Клиника · Рабочий день</p>
        <h1>{section === "overview" ? "Обзор клиники" : label}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 sm:self-auto">
        <CalendarDays size={16} aria-hidden="true" />
        <span>{ready ? formatDate(today) : "Загрузка даты…"}</span>
      </div>
    </div>
  );
}
