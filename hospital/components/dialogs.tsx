"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { appointmentError, doctors, validatePatient, type PatientDraft } from "@/lib/data";
import type { Appointment, Patient } from "@/lib/types";

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return <dialog ref={ref} className="app-dialog" aria-labelledby={id} onCancel={onClose} onClick={(event) => { if (event.target === ref.current) { const bounds = ref.current.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); } }}>
    <div className="dialog-header"><div><p className="eyebrow">MEDICA / РЕГИСТРАТУРА</p><h2 id={id}>{title}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть окно"><X size={20} /></button></div>
    {children}
  </dialog>;
}

export function PatientEditor({ patient, today, onSave, onClose }: { patient: Patient | "new"; today: string; onSave: (draft: PatientDraft) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<PatientDraft>(patient === "new" ? { name: "", birthDate: "", gender: "female", phone: "", email: "" } : patient);
  const [errors, setErrors] = useState<Partial<Record<keyof PatientDraft, string>>>({});
  const id = useId();
  function field(key: "name" | "birthDate" | "phone" | "email", label: string, type = "text", placeholder = "") {
    return <label className={`form-field ${key === "name" ? "field-full" : ""}`} htmlFor={`${id}-${key}`}>
      <span>{label}</span><input id={`${id}-${key}`} name={key} type={type} placeholder={placeholder} value={draft[key]} required={key !== "email"} min={key === "birthDate" ? "1900-01-01" : undefined} max={key === "birthDate" ? today : undefined} autoComplete={key === "name" ? "name" : key === "phone" ? "tel" : key === "email" ? "email" : "bday"} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${id}-${key}-error` : undefined} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
      {errors[key] && <small id={`${id}-${key}-error`} className="field-error">{errors[key]}</small>}
    </label>;
  }
  return <Modal title={patient === "new" ? "Новый пациент" : "Редактировать пациента"} onClose={onClose}>
    <p className="dialog-description">Заполните данные пациента. Поля со звёздочкой обязательны.</p>
    <form noValidate onSubmit={(event) => { event.preventDefault(); const errors = validatePatient(draft, today); setErrors(errors); if (!Object.keys(errors).length) onSave({ ...draft, name: draft.name.trim().replace(/\s+/g, " "), phone: draft.phone.trim(), email: draft.email.trim() }); }}>
      <div className="form-grid">{field("name", "Фамилия и имя *", "text", "Например, Алия Нурланова")}{field("birthDate", "Дата рождения *", "date")}
        <label className="form-field" htmlFor={`${id}-gender`}><span>Пол</span><select id={`${id}-gender`} value={draft.gender} onChange={(event) => setDraft({ ...draft, gender: event.target.value as Patient["gender"] })}><option value="female">Женский</option><option value="male">Мужской</option></select></label>
        {field("phone", "Телефон *", "tel", "+7 701 123 45 67")}{field("email", "Электронная почта", "email", "name@example.com")}
      </div>
      <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onClose}>Отмена</button><button type="submit" className="primary-button">{patient === "new" ? "Добавить пациента" : "Сохранить изменения"}</button></div>
    </form>
  </Modal>;
}

export function AppointmentEditor({ patients, appointments, today, onSave, onClose }: { patients: Patient[]; appointments: Appointment[]; today: string; onSave: (data: Omit<Appointment, "id">) => void; onClose: () => void }) {
  const [patientId, setPatientId] = useState(patients[0]?.id || "");
  const [doctorId, setDoctorId] = useState(doctors.find((doctor) => doctor.available)!.id);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("09:00");
  const [error, setError] = useState("");
  const id = useId();
  return <Modal title="Запись на приём" onClose={onClose}>
    <p className="dialog-description">Выберите пациента, специалиста и свободное время.</p>
    {!patients.length ? <><p className="notice">Сначала добавьте пациента в разделе «Пациенты».</p><div className="dialog-actions"><button className="secondary-button" onClick={onClose}>Закрыть</button></div></> : <form onSubmit={(event) => { event.preventDefault(); const message = appointmentError(appointments, patientId, doctorId, date, time, today); if (!patients.some((patient) => patient.id === patientId) || !doctors.some((doctor) => doctor.id === doctorId && doctor.available)) { setError("Пациент или врач больше недоступен. Откройте форму заново."); return; } setError(message); if (!message) onSave({ patientId, doctorId, date, time, status: "confirmed" }); }}>
      <div className="form-grid">
        <label className="form-field field-full" htmlFor={`${id}-patient`}><span>Пациент *</span><select id={`${id}-patient`} value={patientId} onChange={(event) => setPatientId(event.target.value)} required>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</select></label>
        <label className="form-field field-full" htmlFor={`${id}-doctor`}><span>Врач *</span><select id={`${id}-doctor`} value={doctorId} onChange={(event) => setDoctorId(event.target.value)} required>{doctors.filter((doctor) => doctor.available).map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name} · {doctor.specialty}</option>)}</select></label>
        <label className="form-field" htmlFor={`${id}-date`}><span>Дата *</span><input id={`${id}-date`} type="date" value={date} min={today} required onChange={(event) => setDate(event.target.value)} /></label>
        <label className="form-field" htmlFor={`${id}-time`}><span>Время *</span><select id={`${id}-time`} value={time} onChange={(event) => setTime(event.target.value)}>{Array.from({ length: 20 }, (_, index) => `${String(8 + Math.floor(index / 2)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`).map((value) => <option key={value}>{value}</option>)}</select></label>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <p className="dialog-description">Приём длится 30 минут. Занятое время проверяется при сохранении.</p>
      <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onClose}>Отмена</button><button type="submit" className="primary-button">Создать запись</button></div>
    </form>}
  </Modal>;
}
