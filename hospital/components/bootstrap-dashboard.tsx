"use client";

import { ArrowRight, CalendarDays, CalendarPlus, Check, ClipboardList, HeartPulse, Mail, Pencil, Plus, Search, Stethoscope, Trash2, Users, X } from "lucide-react";
import type { Appointment, DashboardModel, Patient } from "@/lib/types";
import { formatDate, initials, statusLabels } from "@/lib/format";
import styles from "./bootstrap-dashboard.module.css";

const statIcons = { patients: Users, doctors: Stethoscope, appointments: ClipboardList, today: CalendarDays };
const statusClasses = { confirmed: "text-success-emphasis bg-success-subtle", pending: "text-warning-emphasis bg-warning-subtle", completed: "text-primary-emphasis bg-primary-subtle", cancelled: "text-secondary-emphasis bg-secondary-subtle" };

function EmptyState({ title, detail, onAction, action }: { title: string; detail: string; onAction?: () => void; action?: string }) {
  return <div className={styles.empty}>
    <div className={styles.emptyIcon}><Search size={24} aria-hidden="true" /></div>
    <h3 className="h6 mb-2">{title}</h3><p className="text-body-secondary small mb-3">{detail}</p>
    {onAction && <button type="button" className="btn btn-outline-primary btn-sm" onClick={onAction}>{action}</button>}
  </div>;
}

function PatientTable({ patients, model, compact = false }: { patients: Patient[]; model: DashboardModel; compact?: boolean }) {
  return <div className="table-responsive">
    <table className={`table table-hover align-middle mb-0 ${styles.table}`}>
      <caption className="visually-hidden">{compact ? "Недавно зарегистрированные пациенты" : "Пациенты больницы"}</caption>
      <thead><tr><th scope="col">Пациент</th>{!compact && <th scope="col">Дата рождения</th>}<th scope="col">Телефон</th><th scope="col">Регистрация</th><th scope="col" className="text-end">Действия</th></tr></thead>
      <tbody>{patients.map((patient, index) => <tr key={patient.id}>
        <td><div className="d-flex align-items-center gap-3"><span className={`${styles.avatar} ${index % 2 ? styles.avatarLavender : ""}`}>{initials(patient.name)}</span><div><div className={styles.personName}>{patient.name}</div><div className="small text-body-secondary">{patient.email || patient.id}</div></div></div></td>
        {!compact && <td><div>{formatDate(patient.birthDate)}</div><div className="small text-body-secondary">{patient.gender === "female" ? "Женский" : "Мужской"}</div></td>}
        <td className="text-nowrap">{patient.phone}</td><td className="text-nowrap text-body-secondary">{formatDate(patient.registeredAt)}</td>
        <td><div className="d-flex gap-1 justify-content-end">
          <button type="button" className={`btn btn-sm btn-light ${styles.iconButton}`} aria-label={`Редактировать: ${patient.name}`} title="Редактировать" onClick={() => model.onEditPatient(patient)}><Pencil size={15} aria-hidden="true" /></button>
          <button type="button" className={`btn btn-sm btn-light text-danger ${styles.iconButton}`} aria-label={`Удалить: ${patient.name}`} title="Удалить" onClick={() => model.onDeletePatient(patient)}><Trash2 size={15} aria-hidden="true" /></button>
        </div></td>
      </tr>)}</tbody>
    </table>
  </div>;
}

function AppointmentTable({ appointments, model }: { appointments: Appointment[]; model: DashboardModel }) {
  return <div className="table-responsive"><table className={`table table-hover align-middle mb-0 ${styles.table}`}>
    <caption className="visually-hidden">Расписание приёмов</caption>
    <thead><tr><th scope="col">Дата и время</th><th scope="col">Пациент</th><th scope="col">Врач</th><th scope="col">Статус</th><th scope="col" className="text-end">Действие</th></tr></thead>
    <tbody>{appointments.map((appointment) => {
      const patient = model.patients.find((item) => item.id === appointment.patientId);
      const doctor = model.doctors.find((item) => item.id === appointment.doctorId);
      return <tr key={appointment.id}>
        <td className="text-nowrap"><div className={styles.time}>{appointment.time}</div><div className="small text-body-secondary">{formatDate(appointment.date)}</div></td>
        <td className={styles.personName}>{patient?.name ?? "Пациент удалён"}</td>
        <td><div>{doctor?.name ?? "Врач не найден"}</div><div className="small text-body-secondary">{doctor?.specialty}</div></td>
        <td><span className={`badge rounded-pill ${styles.status} ${statusClasses[appointment.status]}`}><span className={styles.dot} />{statusLabels[appointment.status]}</span></td>
        <td className="text-end">{["confirmed", "pending"].includes(appointment.status) ? <button type="button" className="btn btn-sm btn-outline-secondary" aria-label={`Отменить запись: ${patient?.name ?? appointment.id}, ${appointment.time}`} onClick={() => model.onCancelAppointment(appointment)}>Отменить</button> : <span className="text-body-secondary small">—</span>}</td>
      </tr>;
    })}</tbody>
  </table></div>;
}

function SearchField({ model, placeholder }: { model: DashboardModel; placeholder: string }) {
  return <div className={`input-group ${styles.search}`}>
    <span className="input-group-text bg-white border-end-0"><Search size={17} aria-hidden="true" /></span>
    <input className="form-control border-start-0 ps-0" aria-label={placeholder} placeholder={placeholder} value={model.query} onChange={(event) => model.setQuery(event.target.value)} />
    {model.query && <button type="button" className="btn btn-outline-secondary" aria-label="Очистить поиск" onClick={() => model.setQuery("")}><X size={15} aria-hidden="true" /></button>}
  </div>;
}

export default function BootstrapDashboard({ model }: { model: DashboardModel }) {
  const todaysAppointments = model.appointments.filter((item) => item.date === model.today && item.status !== "cancelled").sort((a, b) => a.time.localeCompare(b.time));
  const recentPatients = [...model.patients].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt)).slice(0, 4);

  return <div className={styles.scope}>
    {model.section === "overview" && <>
      <section className={styles.welcome} aria-labelledby="bootstrap-welcome">
        <div><span className={styles.eyebrow}>РЕГИСТРАТУРА · ОБЗОР</span><h2 id="bootstrap-welcome">Забота начинается с порядка.</h2><p>Пациенты, врачи и расписание — всё необходимое для рабочего дня.</p><button type="button" className="btn btn-light d-inline-flex align-items-center gap-2" onClick={model.onAddAppointment}><CalendarPlus size={17} aria-hidden="true" />Новая запись</button></div>
        <div className={styles.welcomeArt} aria-hidden="true"><div className={styles.welcomeCircle}><HeartPulse size={58} strokeWidth={1.4} /></div><span className={styles.artLabel}><span className={styles.artDot} />На связи с пациентами</span></div>
      </section>
      <div className="row g-3 mb-4">{model.stats.map((stat) => {
        const Icon = statIcons[stat.kind];
        return <div className="col-6 col-xl-3" key={stat.kind}><section className={`card h-100 ${styles.statCard}`}><div className="card-body"><div className="d-flex justify-content-between align-items-start mb-3"><span className="small text-body-secondary">{stat.label}</span><span className={styles.statIcon}><Icon size={19} aria-hidden="true" /></span></div><div className={styles.statValue}>{stat.value}</div><div className="small text-body-secondary mt-1">{stat.detail}</div></div></section></div>;
      })}</div>
      <section className={`card mb-4 ${styles.panel}`}>
        <div className="card-header bg-white d-flex align-items-center justify-content-between gap-3 flex-wrap"><div><h3 className="h6 mb-1">Приёмы сегодня</h3><p className="small text-body-secondary mb-0">{formatDate(model.today)} · {todaysAppointments.length} в расписании</p></div><button type="button" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2" onClick={() => model.setSection("appointments")}>Все записи<ArrowRight size={15} aria-hidden="true" /></button></div>
        {todaysAppointments.length ? <AppointmentTable appointments={todaysAppointments.slice(0, 4)} model={model} /> : <EmptyState title="Свободное расписание" detail="На сегодня пока нет приёмов. Создайте первую запись." onAction={model.onAddAppointment} action="Записать пациента" />}
      </section>
      <section className={`card ${styles.panel}`}>
        <div className="card-header bg-white d-flex align-items-center justify-content-between gap-3 flex-wrap"><div><h3 className="h6 mb-1">Новые пациенты</h3><p className="small text-body-secondary mb-0">Последние регистрации в системе</p></div><button type="button" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2" onClick={() => model.setSection("patients")}>Все пациенты<ArrowRight size={15} aria-hidden="true" /></button></div>
        {recentPatients.length ? <PatientTable patients={recentPatients} model={model} compact /> : <EmptyState title="Пока нет пациентов" detail="Добавьте пациента, чтобы начать работу." onAction={model.onAddPatient} action="Добавить пациента" />}
      </section>
    </>}

    {model.section === "patients" && <section className={`card ${styles.panel}`}>
      <div className="card-header bg-white d-flex align-items-center justify-content-between gap-3 flex-wrap"><div><h2 className="h5 mb-1">База пациентов <span className="badge rounded-pill text-primary-emphasis bg-primary-subtle ms-2">{model.patients.length}</span></h2><p className="small text-body-secondary mb-0">Личные данные и контакты пациентов</p></div><button type="button" className="btn btn-primary d-flex align-items-center gap-2" onClick={model.onAddPatient}><Plus size={17} aria-hidden="true" />Добавить пациента</button></div>
      <div className={`card-body border-bottom ${styles.filters}`}>
        <SearchField model={model} placeholder="Поиск по ФИО, телефону или почте" />
        <select className="form-select" aria-label="Фильтр по полу" value={model.gender} onChange={(event) => model.setGender(event.target.value)}><option value="">Любой пол</option><option value="female">Женский</option><option value="male">Мужской</option></select>
        <select className="form-select" aria-label="Сортировка пациентов" value={model.sort} onChange={(event) => model.setSort(event.target.value)}><option value="name">По имени: А–Я</option><option value="registeredAt">Сначала новые</option></select>
        {(model.query || model.gender || model.sort !== "name") && <button type="button" className="btn btn-outline-secondary" onClick={() => { model.setQuery(""); model.setGender(""); model.setSort("name"); }}>Сбросить</button>}
      </div>
      {model.filteredPatients.length ? <PatientTable patients={model.filteredPatients} model={model} /> : <EmptyState title="Пациенты не найдены" detail={model.patients.length ? "Попробуйте изменить запрос или сбросить фильтры." : "Добавьте первого пациента в базу."} onAction={model.patients.length ? () => { model.setQuery(""); model.setGender(""); } : model.onAddPatient} action={model.patients.length ? "Сбросить фильтры" : "Добавить пациента"} />}
      <div className="card-footer bg-white small text-body-secondary">Показано: {model.filteredPatients.length} из {model.patients.length}</div>
    </section>}

    {model.section === "doctors" && <>
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4"><div><h2 className="h5 mb-1">Команда специалистов</h2><p className="text-body-secondary small mb-0">Контакты и доступность врачей клиники</p></div><SearchField model={model} placeholder="Найти врача или специальность" /></div>
      {model.filteredDoctors.length ? <div className="row g-4">{model.filteredDoctors.map((doctor, index) => <div key={doctor.id} className="col-md-6 col-xl-4"><article className={`card h-100 ${styles.doctorCard}`}><div className="card-body p-4"><div className="d-flex align-items-start justify-content-between mb-4"><span className={`${styles.doctorAvatar} ${index % 2 ? styles.avatarLavender : ""}`}>{initials(doctor.name)}</span><span className={`badge rounded-pill ${doctor.available ? "text-success-emphasis bg-success-subtle" : "text-secondary-emphasis bg-secondary-subtle"}`}>{doctor.available ? "Ведёт приём" : "Недоступен"}</span></div><h3 className="h6 mb-1">{doctor.name}</h3><p className="text-body-secondary small mb-4">{doctor.specialty}</p><div className="d-flex align-items-center gap-2 small text-body-secondary border-top pt-3"><Stethoscope size={16} aria-hidden="true" />Кабинет {doctor.room}</div></div></article></div>)}</div> : <div className={`card ${styles.panel}`}><EmptyState title="Врачи не найдены" detail="Попробуйте другое имя или специальность." onAction={() => model.setQuery("")} action="Очистить поиск" /></div>}
    </>}

    {model.section === "appointments" && <section className={`card ${styles.panel}`}>
      <div className="card-header bg-white d-flex align-items-center justify-content-between gap-3 flex-wrap"><div><h2 className="h5 mb-1">Расписание приёмов</h2><p className="small text-body-secondary mb-0">Все записи пациентов и их текущий статус</p></div><button type="button" className="btn btn-primary d-flex align-items-center gap-2" onClick={model.onAddAppointment}><CalendarPlus size={17} aria-hidden="true" />Новая запись</button></div>
      <div className="card-body border-bottom"><SearchField model={model} placeholder="Поиск пациента, врача или статуса" /></div>
      {model.filteredAppointments.length ? <AppointmentTable appointments={model.filteredAppointments} model={model} /> : <EmptyState title="Записи не найдены" detail={model.query ? "Измените поисковый запрос." : "Запишите пациента на первый приём."} onAction={model.query ? () => model.setQuery("") : model.onAddAppointment} action={model.query ? "Очистить поиск" : "Новая запись"} />}
      <div className="card-footer bg-white d-flex align-items-center gap-2 small text-body-secondary"><Check size={15} aria-hidden="true" />Показано: {model.filteredAppointments.length} из {model.appointments.length}</div>
    </section>}
    <p className={styles.footer}><Mail size={13} aria-hidden="true" />Учебный проект · Все данные вымышлены</p>
  </div>;
}
