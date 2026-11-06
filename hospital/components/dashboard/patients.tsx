import { ArrowRight, Pencil, Plus, Trash2 } from "@/components/icons";
import { formatDate, initials } from "@/lib/format";
import type { DashboardModel, Patient } from "@/lib/types";
import { avatarColors, EmptyState, PanelHeading, SearchField, styles } from "./shared";
import { LocalizedContent } from "../locale-provider";

function PatientFilters({ model }: { model: DashboardModel }) {
  function resetFilters() {
    model.setQuery("");
    model.setGender("");
    model.setSort("name");
  }

  return (
    <LocalizedContent><div className="flex flex-wrap gap-3 border-b border-slate-100 p-4">
      <SearchField placeholder="Поиск по ФИО или телефону" query={model.query} onQueryChange={model.setQuery} />
      <select aria-label="Фильтр по полу" className={styles.field} value={model.gender} onChange={(event) => model.setGender(event.target.value)}>
        <option value="">Любой пол</option>
        <option value="female">Женский</option>
        <option value="male">Мужской</option>
      </select>
      <select aria-label="Сортировка пациентов" className={styles.field} value={model.sort} onChange={(event) => model.setSort(event.target.value)}>
        <option value="name">По имени</option>
        <option value="registeredAt">Сначала новые</option>
      </select>
      <button type="button" className={styles.secondary} onClick={resetFilters}>Сбросить</button>
    </div></LocalizedContent>
  );
}

function PatientRow({ patient, index, model }: { patient: Patient; index: number; model: DashboardModel }) {
  return (
    <LocalizedContent><tr className="border-t border-slate-100 transition-colors hover:bg-slate-50/70">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColors[index % avatarColors.length]}`}>
            {initials(patient.name)}
          </span>
          <div>
            <div className="font-medium text-slate-800">{patient.name}</div>
            <div className="mt-1 text-xs text-slate-500">{patient.id} · {patient.gender === "female" ? "Женский" : "Мужской"}</div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-slate-500">{formatDate(patient.birthDate, model.locale)}</td>
      <td className="whitespace-nowrap px-4 py-4 text-slate-600">{patient.phone}</td>
      <td className="whitespace-nowrap px-4 py-4 text-slate-500">{formatDate(patient.registeredAt, model.locale)}</td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-1">
          <button type="button" aria-label={`Редактировать: ${patient.name}`} className="grid size-11 place-items-center rounded-lg text-slate-500 hover:bg-teal-50 hover:text-teal-700" onClick={() => model.onEditPatient(patient)}>
            <Pencil size={16} />
          </button>
          <button type="button" aria-label={`Удалить: ${patient.name}`} className="grid size-11 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600" onClick={() => model.onDeletePatient(patient)}>
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr></LocalizedContent>
  );
}

export function PatientsSection({ model, overview = false }: { model: DashboardModel; overview?: boolean }) {
  const patients = overview
    ? [...model.patients].sort((first, second) => second.registeredAt.localeCompare(first.registeredAt)).slice(0, 5)
    : model.filteredPatients;

  return (
    <LocalizedContent><section className={styles.panel}>
      <PanelHeading
        title={overview ? "Недавно добавленные пациенты" : "Все пациенты"}
        description={overview ? "Последние регистрации в вашей клинике" : `Найдено: ${patients.length} из ${model.patients.length}`}
      >
        {overview ? (
          <button type="button" className={styles.link} onClick={() => model.setSection("patients")}>
            Все пациенты <ArrowRight size={14} />
          </button>
        ) : (
          <button type="button" className={styles.primary} onClick={model.onAddPatient}>
            <Plus size={16} />Добавить пациента
          </button>
        )}
      </PanelHeading>
      {!overview && <PatientFilters model={model} />}
      {patients.length === 0 ? (
        <EmptyState>Пациенты не найдены. Измените поиск или добавьте пациента.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-medium text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">Пациент</th>
                <th scope="col" className="px-4 py-3 font-medium">Дата рождения</th>
                <th scope="col" className="px-4 py-3 font-medium">Телефон</th>
                <th scope="col" className="px-4 py-3 font-medium">Регистрация</th>
                <th scope="col" className="px-6 py-3 text-right font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, index) => <PatientRow key={patient.id} patient={patient} index={index} model={model} />)}
            </tbody>
          </table>
        </div>
      )}
      <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
        {overview ? `Всего пациентов в клинике: ${model.patients.length}` : "Изменения сохраняются в этом браузере"}
      </div>
    </section></LocalizedContent>
  );
}
