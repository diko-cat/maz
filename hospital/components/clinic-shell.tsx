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
      {open && <button className="sidebar-backdrop" aria-label="Закрыть меню" onClick={onClose} />}
      <aside id="app-sidebar" className={`app-sidebar ${open ? "is-open" : ""}`}>
        <Link href="/" className="brand">
          <span className="brand-symbol"><HeartPulse size={25} strokeWidth={1.7} aria-hidden="true" /></span>
          <span>maz<span className="brand-dot">.</span></span>
        </Link>
        <div className="workspace-label">УПРАВЛЕНИЕ КЛИНИКОЙ</div>
        <nav aria-label="Основная навигация" className="main-nav">
          {sectionOrder.map((id) => {
            const { label, icon: Icon } = sections[id];
            return (
              <button
                key={id}
                className={`nav-item ${section === id ? "is-active" : ""}`}
                onClick={() => onNavigate(id)}
                aria-current={section === id ? "page" : undefined}
              >
                <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
                <span>{label}</span>
                {id === "patients" && <span className="nav-count">{patientCount}</span>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <span className="sidebar-note-icon"><Activity size={20} aria-hidden="true" /></span>
          <h2>Больше времени для людей</h2>
          <p>Всё остальное возьмёт на себя maz.</p>
          <span className="demo-tag"><span />Учебный проект</span>
        </div>
        <div className="sidebar-bottom">
          <button className="help-button" onClick={onHelp}>
            <CircleHelp size={18} aria-hidden="true" />
            О проекте
            <ArrowUpRight size={14} aria-hidden="true" />
          </button>
          <div className="profile">
            <span className="profile-avatar">ДК</span>
            <div><strong>Демо-клиника</strong><small>Администратор</small></div>
            <span className="profile-online" title="Локальный режим" />
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
    <header className="app-topbar">
      <div className="topbar-context">
        <button
          className="icon-button mobile-menu"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
        >
          <MenuIcon size={21} aria-hidden="true" />
        </button>
        <span>Рабочее пространство</span>
        <span className="breadcrumb-slash" aria-hidden="true">/</span>
        <strong>{sections[section].label}</strong>
      </div>
      <div className="topbar-right">
        <span className="local-mode">Локальный режим</span>
        <span className="topbar-avatar">ДК</span>
      </div>
    </header>
  );
}

export function PageHeading({ section, today, ready }: { section: Section; today: string; ready: boolean }) {
  const { label, description } = sections[section];
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">ВАША КЛИНИКА, КАЖДЫЙ ДЕНЬ</p>
        <h1>{section === "overview" ? "Обзор клиники" : label}</h1>
        <p className="page-description">{description}</p>
      </div>
      <div className="date-chip">
        <CalendarDays size={16} aria-hidden="true" />
        <span>{ready ? formatDate(today) : "Загрузка даты…"}</span>
      </div>
    </div>
  );
}
