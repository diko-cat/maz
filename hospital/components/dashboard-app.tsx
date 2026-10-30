"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, ArrowUpRight, CalendarDays, CircleHelp, HeartPulse, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Stethoscope, Users, X } from "lucide-react";
import { doctors, type PatientDraft } from "@/lib/data";
import { formatDate, statusLabels } from "@/lib/format";
import { updateHospital, useHospitalStore } from "@/lib/store";
import type { Appointment, DashboardModel, Patient, Section } from "@/lib/types";
import { AppointmentEditor, Modal, PatientEditor } from "./dialogs";
import TailwindDashboard from "./tailwind-dashboard";

const sections = [
  { id: "overview", label: "Обзор", icon: LayoutDashboard, description: "Всё о работе клиники в одном месте" },
  { id: "patients", label: "Пациенты", icon: Users, description: "Информация о пациентах и история регистрации" },
  { id: "doctors", label: "Врачи", icon: Stethoscope, description: "Специалисты и кабинеты вашей клиники" },
  { id: "appointments", label: "Записи на приём", icon: CalendarDays, description: "Расписание и управление записями" },
] as const;

export default function DashboardApp() {
  const store = useHospitalStore();
  const [section, setCurrentSection] = useState<Section>("overview");
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("");
  const [sort, setSort] = useState("name");
  const [editor, setEditor] = useState<Patient | "new" | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);
  const [appointmentEditor, setAppointmentEditor] = useState(false);
  const [help, setHelp] = useState(false);
  const [toast, setToast] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const active = sections.find((item) => item.id === section)!;
  function setSection(value: Section) { setCurrentSection(value); setQuery(""); setSidebarOpen(false); }
  const needle = query.trim().toLocaleLowerCase("ru");
  const matches = (...values: string[]) => values.join(" ").toLocaleLowerCase("ru").includes(needle);
  function savePatient(draft: PatientDraft) {
    if (!editor) return;
    const patients = editor === "new" ? [...store.patients, { ...draft, id: `P-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, registeredAt: store.today }] : store.patients.map((p) => p.id === editor.id ? { ...p, ...draft } : p);
    updateHospital({ patients, appointments: store.appointments });
    setEditor(null); setToast(editor === "new" ? "Пациент добавлен" : "Данные пациента обновлены");
  }
  function saveAppointment(data: Omit<Appointment, "id">) {
    updateHospital({ patients: store.patients, appointments: [...store.appointments, { ...data, id: `A-${crypto.randomUUID().slice(0, 8).toUpperCase()}` }] });
    setAppointmentEditor(false); setToast("Запись на приём создана");
  }
  const model: DashboardModel = {
    section, setSection, query, setQuery, gender, setGender, sort, setSort,
    patients: store.patients, doctors, appointments: store.appointments, today: store.today, ready: store.ready,
    filteredPatients: store.patients.filter((p) => matches(p.name, p.phone, p.email) && (!gender || p.gender === gender)).sort((a, b) => sort === "registeredAt" ? b.registeredAt.localeCompare(a.registeredAt) : a.name.localeCompare(b.name, "ru")),
    filteredDoctors: doctors.filter((d) => matches(d.name, d.specialty)),
    filteredAppointments: store.appointments.filter((a) => matches(store.patients.find((p) => p.id === a.patientId)?.name || "", doctors.find((d) => d.id === a.doctorId)?.name || "", a.date, a.time, statusLabels[a.status])).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
    stats: [
      { kind: "patients", label: "Всего пациентов", value: store.patients.length, detail: "Зарегистрировано в клинике" },
      { kind: "doctors", label: "Врачи", value: doctors.length, detail: `${doctors.filter((d) => d.available).length} специалиста ведут приём` },
      { kind: "appointments", label: "Записи на приём", value: store.appointments.filter((a) => a.status !== "cancelled").length, detail: "Без отменённых записей" },
      { kind: "today", label: "Приёмы сегодня", value: store.appointments.filter((a) => a.date === store.today && a.status !== "cancelled").length, detail: "По расписанию на сегодня" },
    ],
    onAddPatient: () => setEditor("new"), onEditPatient: setEditor, onDeletePatient: setDeleting, onAddAppointment: () => setAppointmentEditor(true),
    onCancelAppointment: (appointment) => { updateHospital({ patients: store.patients, appointments: store.appointments.map((a) => a.id === appointment.id ? { ...a, status: "cancelled" } : a) }); setToast("Запись отменена"); },
  };
  return <div className="app-shell">
    <a href="#main-content" className="skip-link">Перейти к содержимому</a>
    {sidebarOpen && <button className="sidebar-backdrop" aria-label="Закрыть меню" onClick={() => setSidebarOpen(false)} />}
    <aside id="app-sidebar" className={`app-sidebar ${sidebarOpen ? "is-open" : ""}`}>
      <Link href="/" className="brand"><span className="brand-symbol"><HeartPulse size={25} strokeWidth={1.7} /></span><span>medica<span className="brand-dot">.</span></span></Link>
      <div className="workspace-label">УПРАВЛЕНИЕ КЛИНИКОЙ</div>
      <nav aria-label="Основная навигация" className="main-nav">{sections.map((item) => <button key={item.id} className={`nav-item ${section === item.id ? "is-active" : ""}`} onClick={() => setSection(item.id)} aria-current={section === item.id ? "page" : undefined}><item.icon size={19} strokeWidth={1.7} /><span>{item.label}</span>{item.id === "patients" && <span className="nav-count">{store.patients.length}</span>}</button>)}</nav>
      <div className="sidebar-note"><span className="sidebar-note-icon"><Activity size={20} /></span><h2>Больше времени для людей</h2><p>Всё остальное возьмёт на себя Medica.</p><span className="demo-tag"><span />Учебный проект</span></div>
      <div className="sidebar-bottom"><button className="help-button" onClick={() => setHelp(true)}><CircleHelp size={18} />О проекте <ArrowUpRight size={14} /></button><div className="profile"><span className="profile-avatar">ДК</span><div><strong>Демо-клиника</strong><span>Администратор</span></div><span className="profile-online" title="Локальный режим" /></div></div>
    </aside>
    <div className="app-workspace"><header className="app-topbar"><div className="topbar-context"><button className="icon-button mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? "Закрыть меню" : "Открыть меню"} aria-expanded={sidebarOpen} aria-controls="app-sidebar">{sidebarOpen ? <PanelLeftClose size={21} /> : <PanelLeftOpen size={21} />}</button><span>Рабочее пространство</span><span className="breadcrumb-slash">/</span><strong>{active.label}</strong></div><div className="topbar-right"><span className="local-mode"><i />Локальный режим</span><span className="topbar-avatar">ДК</span></div></header>
      <main id="main-content" className="app-main"><div className="page-heading"><div><p className="eyebrow">ВАША КЛИНИКА, КАЖДЫЙ ДЕНЬ</p><h1>{active.label === "Обзор" ? "Обзор клиники" : active.label}</h1><p className="page-description">{active.description}</p></div><div className="date-chip"><CalendarDays size={16} /><span>{store.ready ? formatDate(store.today) : "Загрузка даты…"}</span></div></div>
        {store.storageWarning && <p className="notice" role="status">{store.storageWarning}</p>}
        {!store.ready ? <div className="loading-state" role="status"><HeartPulse size={30} />Загружаем данные клиники…</div> : <TailwindDashboard model={model} />}
        <footer className="app-footer"><span>© 2026 Medica · Забота в каждом действии</span><span>Демонстрационные данные</span></footer>
      </main>
    </div>
    {editor && <PatientEditor patient={editor} today={store.today} onSave={savePatient} onClose={() => setEditor(null)} />}
    {appointmentEditor && <AppointmentEditor patients={store.patients} appointments={store.appointments} today={store.today} onSave={saveAppointment} onClose={() => setAppointmentEditor(false)} />}
    {deleting && <Modal title="Удалить пациента?" onClose={() => setDeleting(null)}><p className="dialog-description">Пациент <strong>{deleting.name}</strong> будет удалён вместе со связанными записями на приём. Отменить это действие нельзя.</p><div className="dialog-actions"><button className="secondary-button" onClick={() => setDeleting(null)}>Оставить пациента</button><button className="danger-button" onClick={() => { updateHospital({ patients: store.patients.filter((p) => p.id !== deleting.id), appointments: store.appointments.filter((a) => a.patientId !== deleting.id) }); setDeleting(null); setToast("Пациент и связанные записи удалены"); }}>Удалить пациента</button></div></Modal>}
    {help && <Modal title="О проекте Medica" onClose={() => setHelp(false)}><p className="dialog-description">Учебная система управления клиникой на Next.js с интерфейсом на Tailwind CSS.</p><div className="about-details"><p><strong>Что работает</strong><br />Поиск, фильтры, добавление и редактирование пациентов, удаление с подтверждением, запись на приём и проверка занятого времени.</p><p><strong>Где хранятся данные</strong><br />В localStorage этого браузера. Используется вымышленный набор данных. Приложение работает без бэкенда, базы данных и авторизации.</p><a href="https://github.com/diko-cat/maz" target="_blank" rel="noreferrer">Репозиторий на GitHub ↗</a></div><div className="dialog-actions"><button className="primary-button" onClick={() => setHelp(false)}>Понятно</button></div></Modal>}
    {toast && <div className="toast-message" role="status"><span className="toast-check">✓</span>{toast}<button className="icon-button" onClick={() => setToast("")} aria-label="Закрыть уведомление"><X size={16} /></button></div>}
  </div>;
}
