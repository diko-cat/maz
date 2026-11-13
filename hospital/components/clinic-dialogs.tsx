"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type HTMLInputTypeAttribute,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { X } from "@/components/icons";
import {
  appointmentError,
  doctors,
  validatePatient,
  type PatientDraft,
} from "@/lib/data";
import type { Appointment, Patient } from "@/lib/types";
import { LocalizedContent } from "./locale-provider";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

type PatientEditorProps = {
  patient: Patient | "new";
  today: string;
  onSave: (draft: PatientDraft) => void;
  onClose: () => void;
};

type AppointmentEditorProps = {
  patients: Patient[];
  appointments: Appointment[];
  today: string;
  initialDoctorId?: string;
  onSave: (data: Omit<Appointment, "id">) => void;
  onClose: () => void;
};

type PatientErrors = Partial<Record<keyof PatientDraft, string>>;
type PatientInputName = Exclude<keyof PatientDraft, "gender">;
type AppointmentDraft = Omit<Appointment, "id" | "status">;

type FieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  full?: boolean;
  error?: string;
};

type PatientInputProps = {
  name: PatientInputName;
  label: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  prefix: string;
  value: string;
  today: string;
  error?: string;
  onChange: (name: PatientInputName, value: string) => void;
};

const patientAutocomplete: Record<PatientInputName, string> = {
  name: "name",
  birthDate: "bday",
  phone: "tel",
  email: "email",
};

const appointmentTimes = Array.from({ length: 20 }, (_, index) => {
  const hour = String(8 + Math.floor(index / 2)).padStart(2, "0");
  return `${hour}:${index % 2 ? "30" : "00"}`;
});

function Field({ id, label, children, full = false, error }: FieldProps) {
  return (
    <label className={`form-field${full ? " field-full" : ""}`} htmlFor={id}>
      <span>{label}</span>
      {children}
      {error && (
        <small id={`${id}-error`} className="field-error" aria-live="polite">
          {error}
        </small>
      )}
    </label>
  );
}

function PatientInput({
  name,
  label,
  type = "text",
  placeholder = "",
  prefix,
  value,
  today,
  error,
  onChange,
}: PatientInputProps) {
  const id = `${prefix}-${name}`;
  const isBirthDate = name === "birthDate";

  return (
    <Field id={id} label={label} full={name === "name"} error={error}>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        required={name !== "email"}
        min={isBirthDate ? "1900-01-01" : undefined}
        max={isBirthDate ? today : undefined}
        autoComplete={patientAutocomplete[name]}
        spellCheck={name === "email" ? false : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(name, event.target.value)}
      />
    </Field>
  );
}

export function Modal({ title, children, onClose }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    onClose();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    const dialog = event.currentTarget;
    if (event.target !== dialog) return;

    const bounds = dialog.getBoundingClientRect();
    const outsideDialog = event.clientX < bounds.left
      || event.clientX > bounds.right
      || event.clientY < bounds.top
      || event.clientY > bounds.bottom;

    if (outsideDialog) onClose();
  }

  return (
    <LocalizedContent><dialog
      ref={dialogRef}
      className="app-dialog"
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      <div className="dialog-header">
        <div>
          <p className="eyebrow">maz / Регистратура</p>
          <h2 id={titleId}>{title}</h2>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Закрыть окно"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog></LocalizedContent>
  );
}

function initialPatientDraft(patient: Patient | "new"): PatientDraft {
  if (patient === "new") {
    return { name: "", birthDate: "", gender: "female", phone: "", email: "" };
  }

  return {
    name: patient.name,
    birthDate: patient.birthDate,
    gender: patient.gender,
    phone: patient.phone,
    email: patient.email,
  };
}

export function PatientEditor({ patient, today, onSave, onClose }: PatientEditorProps) {
  const [draft, setDraft] = useState(() => initialPatientDraft(patient));
  const [errors, setErrors] = useState<PatientErrors>({});
  const prefix = useId();
  const creating = patient === "new";

  function updateField(name: PatientInputName, value: string) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validatePatient(draft, today);
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      event.currentTarget.querySelector<HTMLInputElement>(`[name="${firstError}"]`)?.focus();
      return;
    }

    onSave({
      ...draft,
      name: draft.name.trim().replace(/\s+/g, " "),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
    });
  }

  const inputProps = { prefix, today, onChange: updateField };

  return (
    <Modal
      title={creating ? "Новый пациент" : "Редактировать пациента"}
      onClose={onClose}
    >
      <p className="dialog-description">
        Заполните данные пациента. Поля со звёздочкой обязательны.
      </p>
      <form noValidate onSubmit={handleSubmit}>
        <div className="form-grid">
          <PatientInput
            {...inputProps}
            name="name"
            label="Фамилия и имя *"
            placeholder="Например, Алия Нурланова"
            value={draft.name}
            error={errors.name}
          />
          <PatientInput
            {...inputProps}
            name="birthDate"
            label="Дата рождения *"
            type="date"
            value={draft.birthDate}
            error={errors.birthDate}
          />
          <Field id={`${prefix}-gender`} label="Пол">
            <select
              id={`${prefix}-gender`}
              name="gender"
              value={draft.gender}
              onChange={(event) => {
                const gender = event.target.value as Patient["gender"];
                setDraft((current) => ({ ...current, gender }));
              }}
            >
              <option value="female">Женский</option>
              <option value="male">Мужской</option>
            </select>
          </Field>
          <PatientInput
            {...inputProps}
            name="phone"
            label="Телефон *"
            type="tel"
            placeholder="+7 701 123 45 67"
            value={draft.phone}
            error={errors.phone}
          />
          <PatientInput
            {...inputProps}
            name="email"
            label="Электронная почта"
            type="email"
            placeholder="name@example.com"
            value={draft.email}
            error={errors.email}
          />
        </div>
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="primary-button">
            {creating ? "Добавить пациента" : "Сохранить изменения"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function AppointmentEditor({
  patients,
  appointments,
  today,
  initialDoctorId,
  onSave,
  onClose,
}: AppointmentEditorProps) {
  const availableDoctors = doctors.filter((doctor) => doctor.available);
  const [draft, setDraft] = useState<AppointmentDraft>(() => ({
    patientId: patients[0]?.id ?? "",
    doctorId: initialDoctorId ?? availableDoctors[0]?.id ?? "",
    date: today,
    time: "09:00",
  }));
  const [error, setError] = useState("");
  const prefix = useId();
  const errorId = `${prefix}-error`;
  const canBook = patients.length > 0 && availableDoctors.length > 0;

  function updateField(name: keyof AppointmentDraft, value: string) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const patientExists = patients.some((patient) => patient.id === draft.patientId);
    const doctorAvailable = availableDoctors.some((doctor) => doctor.id === draft.doctorId);
    if (!patientExists || !doctorAvailable) {
      setError("Пациент или врач больше недоступен. Откройте форму заново.");
      return;
    }

    const message = appointmentError(
      appointments,
      draft.patientId,
      draft.doctorId,
      draft.date,
      draft.time,
      today,
    );
    setError(message);
    if (!message) onSave({ ...draft, status: "confirmed" });
  }

  return (
    <Modal title="Запись на приём" onClose={onClose}>
      <p className="dialog-description">
        Выберите пациента, специалиста и свободное время.
      </p>
      {!canBook ? (
        <>
          <p className="notice">
            {!patients.length
              ? "Сначала добавьте пациента в разделе «Пациенты»."
              : "Сейчас нет доступных врачей для записи."}
          </p>
          <div className="dialog-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Закрыть
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} aria-describedby={error ? errorId : undefined}>
          <div className="form-grid">
            <Field id={`${prefix}-patient`} label="Пациент *" full>
              <select
                id={`${prefix}-patient`}
                name="patientId"
                value={draft.patientId}
                onChange={(event) => updateField("patientId", event.target.value)}
                required
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </Field>
            <Field id={`${prefix}-doctor`} label="Врач *" full>
              <select
                id={`${prefix}-doctor`}
                name="doctorId"
                value={draft.doctorId}
                onChange={(event) => updateField("doctorId", event.target.value)}
                required
              >
                {availableDoctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} · {doctor.specialty}
                  </option>
                ))}
              </select>
            </Field>
            <Field id={`${prefix}-date`} label="Дата *">
              <input
                id={`${prefix}-date`}
                name="date"
                type="date"
                value={draft.date}
                min={today}
                required
                onChange={(event) => updateField("date", event.target.value)}
              />
            </Field>
            <Field id={`${prefix}-time`} label="Время *">
              <select
                id={`${prefix}-time`}
                name="time"
                value={draft.time}
                onChange={(event) => updateField("time", event.target.value)}
              >
                {appointmentTimes.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </Field>
          </div>
          {error && <p id={errorId} className="field-error" role="alert">{error}</p>}
          <p className="dialog-description">
            Приём длится 30 минут. Занятое время проверяется при сохранении.
          </p>
          <div className="dialog-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="primary-button">Создать запись</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
