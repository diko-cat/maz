import { X } from "@/components/icons";
import type { Appointment, Patient } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Modal } from "./clinic-dialogs";

interface DeletePatientProps {
  patient: Patient;
  onConfirm: () => void;
  onClose: () => void;
}

export function CancelAppointmentDialog({ appointment, onConfirm, onClose }: { appointment: Appointment; onConfirm: () => void; onClose: () => void }) {
  return <Modal title="Отменить запись?" onClose={onClose}>
    <p className="dialog-description">Запись на {formatDate(appointment.date)} в {appointment.time} будет отменена. Время врача станет доступно для новой записи.</p>
    <div className="dialog-actions"><button className="secondary-button" onClick={onClose}>Оставить запись</button><button className="danger-button" onClick={onConfirm}>Отменить запись</button></div>
  </Modal>;
}

export function DeletePatientDialog({ patient, onConfirm, onClose }: DeletePatientProps) {
  return (
    <Modal title="Удалить пациента?" onClose={onClose}>
      <p className="dialog-description">
        Пациент <strong>{patient.name}</strong> будет удалён вместе со связанными записями на приём.
        Отменить это действие нельзя.
      </p>
      <div className="dialog-actions">
        <button className="secondary-button" onClick={onClose}>Оставить пациента</button>
        <button className="danger-button" onClick={onConfirm}>Удалить пациента</button>
      </div>
    </Modal>
  );
}

export function AboutClinic({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="О проекте maz" onClose={onClose}>
      <p className="dialog-description">
        Учебная система управления клиникой на Next.js с интерфейсом на Tailwind CSS.
      </p>
      <div className="about-details">
        <p>
          <strong>Что работает</strong><br />
          Поиск, фильтры, добавление и редактирование пациентов, удаление с подтверждением,
          запись на приём и проверка занятого времени.
        </p>
        <p>
          <strong>Где хранятся данные</strong><br />
          В localStorage этого браузера. Используется вымышленный набор данных.
          Приложение работает без бэкенда, базы данных и авторизации.
        </p>
        <a href="https://github.com/diko-cat/maz" target="_blank" rel="noreferrer">Репозиторий на GitHub ↗</a>
      </div>
      <div className="dialog-actions">
        <button className="primary-button" onClick={onClose}>Понятно</button>
      </div>
    </Modal>
  );
}

export function Notification({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="toast-message" role="status">
      <span className="toast-check" aria-hidden="true">✓</span>
      {message}
      <button className="icon-button" onClick={onClose} aria-label="Закрыть уведомление">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
