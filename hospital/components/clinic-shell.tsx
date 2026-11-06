import Link from "next/link";
import {
  Activity, ArrowUpRight, CalendarDays, CircleHelp, HeartPulse,
  LayoutDashboard, PanelLeftClose, PanelLeftOpen, Stethoscope, Users, UserRound,
} from "@/components/icons";
import { formatDate } from "@/lib/format";
import type { Section } from "@/lib/types";
import { ClinicUserMenu } from "./clinic-user-menu";

const sections = {
  overview: { label: "Обзор", description: "Всё о работе клиники в одном месте", icon: LayoutDashboard },
  patients: { label: "Пациенты", description: "Информация о пациентах и история регистрации", icon: Users },
  doctors: { label: "Врачи", description: "Специалисты и кабинеты вашей клиники", icon: Stethoscope },
  appointments: { label: "Записи на приём", description: "Расписание и управление записями", icon: CalendarDays },
  profile: { label: "Профиль", description: "Ваши контактные данные и настройки аккаунта", icon: UserRound },
} satisfies Record<Section, { label: string; description: string; icon: typeof Users }>;

const sectionOrder: Section[] = ["overview", "patients", "doctors", "appointments", "profile"];

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export const defaultProfile: UserProfile = { name: "Администратор клиники", role: "Администратор", email: "", phone: "" };
export function profileInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("ru") ?? "").join("") || "А";
}

interface SidebarProps {
  section: Section;
  patientCount: number;
  open: boolean;
  onNavigate: (section: Section) => void;
  onClose: () => void;
  onHelp: () => void;
  profile: UserProfile;
}

export function ClinicSidebar({ section, patientCount, open, onNavigate, onClose, onHelp, profile }: SidebarProps) {
  return (
    <>
      {open && <button className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" aria-label="Закрыть меню" onClick={onClose} />}
      <aside id="app-sidebar" className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto bg-slate-950 p-5 text-white transition-transform duration-200 motion-reduce:transition-none md:translate-x-0 ${open ? "translate-x-0 visible" : "-translate-x-full invisible md:visible"}`}>
        <Link href="/" aria-label="maz — главная" className="flex items-center gap-3 px-3 py-3 text-3xl font-semibold tracking-tight text-white">
          <span className="grid size-10 place-items-center rounded-xl bg-teal-300 text-slate-950"><HeartPulse size={25} strokeWidth={1.5} /></span>
          <span>maz<span className="text-teal-300">.</span></span>
        </Link>
        <div className="mb-3 mt-10 px-3 text-xs font-medium text-slate-400">Управление клиникой</div>
        <nav aria-label="Основная навигация" className="flex flex-col gap-1">
          {sectionOrder.map((id) => {
            const { label, icon: Icon } = sections[id];
            return (
              <button
                key={id}
                className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${section === id ? "bg-white/10 font-medium text-teal-200 ring-1 ring-inset ring-white/10" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                onClick={() => onNavigate(id)}
                aria-current={section === id ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                <span>{label}</span>
                {id === "patients" && <span className="ml-auto rounded-md bg-white/5 px-2 py-1 text-xs tabular-nums text-slate-400">{patientCount}</span>}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto px-3 pb-8 pt-16 text-xs leading-relaxed text-slate-400 [&_h2]:mb-2 [&_h2]:text-sm [&_h2]:font-medium [&_h2]:text-white">
          <span className="mb-4 block text-teal-300"><Activity size={24} /></span>
          <h2>Рядом с пациентом</h2>
          <p>Меньше рутины.<br />Больше времени для заботы.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-xs text-slate-400"><span className="size-1.5 rounded-full bg-teal-300" />Учебная клиника</span>
        </div>
        <div className="border-t border-white/10 pt-4">
          <button className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white [&_svg:last-child]:ml-auto" onClick={onHelp}>
            <CircleHelp size={18} aria-hidden="true" />
            О проекте
            <ArrowUpRight size={14} aria-hidden="true" />
          </button>
          <ClinicUserMenu profile={profile} onProfile={() => onNavigate("profile")} />
        </div>
      </aside>
    </>
  );
}

interface HeaderProps {
  section: Section;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  profile: UserProfile;
}

export function ClinicHeader({ section, sidebarOpen, onToggleSidebar, profile }: HeaderProps) {
  const MenuIcon = sidebarOpen ? PanelLeftClose : PanelLeftOpen;
  return (
    <header className="sticky top-0 z-20 flex h-18 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-8">
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
        <Link href="/portal" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-teal-800/15 bg-teal-50 px-3 text-sm font-medium text-teal-900 transition-colors hover:bg-teal-100">
          <UserRound size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Личный кабинет</span>
          <span className="sm:hidden">Кабинет</span>
        </Link>
        <span className="hidden items-center gap-2 text-xs text-slate-500 before:size-1.5 before:rounded-full before:bg-teal-700 sm:flex">Рабочее пространство клиники</span>
        <span className="grid size-8 place-items-center rounded-full border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600" aria-label={profile.name}>{profileInitials(profile.name)}</span>
      </div>
    </header>
  );
}

export function PageHeading({ section, today, ready }: { section: Section; today: string; ready: boolean }) {
  const { label, description } = sections[section];
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-slate-900 sm:[&_h1]:text-4xl">
      <div>
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
