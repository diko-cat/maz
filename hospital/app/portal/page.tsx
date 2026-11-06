"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, ClipboardList, HeartPulse, Stethoscope, Users, UserRound, Wallet } from "@/components/icons";
import { LanguageSwitcher, LocaleProvider, LocalizedContent, useLocale } from "@/components/locale-provider";
import { translate } from "@/lib/i18n";

type Role = "patient" | "doctor" | "admin";
const roles = [
  { id: "patient", title: "Пациент", description: "Записи, услуги и расходы", icon: UserRound },
  { id: "doctor", title: "Врач", description: "Расписание, пациенты и отзывы", icon: Stethoscope },
  { id: "admin", title: "Администратор", description: "Пациенты, врачи и работа клиники", icon: Users },
] as const;
const services = [
  { name: "Первичная консультация", duration: "30 минут", price: "8 000 ₸" },
  { name: "Повторная консультация", duration: "30 минут", price: "6 000 ₸" },
  { name: "Профилактический осмотр", duration: "60 минут", price: "10 000 ₸" },
];

function Panel({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon: typeof CalendarDays }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900"><Icon size={18} className="text-teal-700" aria-hidden="true" />{title}</h2>{children}</section>;
}

export default function PortalPage() {
  return <LocaleProvider><LocalizedContent><Suspense fallback={<main className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600" role="status">Открываем кабинет…</main>}><PortalContent /></Suspense></LocalizedContent></LocaleProvider>;
}

function PortalContent() {
  const params = useSearchParams();
  const { locale } = useLocale();
  const requestedRole = params.get("role");
  const role: Role = requestedRole === "doctor" || requestedRole === "admin" ? requestedRole : "patient";
  const [booked, setBooked] = useState("");
  const [service, setService] = useState<string>(services[0].name);
  const [time, setTime] = useState("");

  return <LocalizedContent><main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
    <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
      <div><Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-800"><HeartPulse size={20} /> maz.</Link><p className="text-sm font-medium text-teal-800">Личный кабинет</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{role === "patient" ? "Кабинет пациента" : role === "doctor" ? "Кабинет врача" : "Кабинет администратора"}</h1><p className="mt-2 text-slate-600">Данные и возможности кабинета зависят от выбранной роли.</p></div>
      <div className="flex flex-wrap items-center gap-3"><LanguageSwitcher /><span className="rounded-full bg-amber-50 px-3 py-2 text-xs text-amber-800">Демонстрационный режим</span></div>
    </header>

    <nav className="mb-8 grid gap-3 sm:grid-cols-3" aria-label="Выбор кабинета">
      {roles.map(({ id, title, description, icon: Icon }) => <Link key={id} href={`/portal?role=${id}`} scroll={false} aria-current={role === id ? "page" : undefined} className={`rounded-2xl border p-5 text-left transition-colors duration-150 hover:bg-teal-50 active:bg-teal-100 ${role === id ? "border-teal-700 bg-teal-50 ring-2 ring-teal-700/15" : "border-slate-200 bg-white"}`}><span className="mb-4 grid size-10 place-items-center rounded-xl bg-white text-teal-800"><Icon size={20} /></span><span className="block font-semibold text-slate-900">{title}</span><span className="mt-1 block text-sm text-slate-500">{description}</span></Link>)}
    </nav>

    {role === "patient" && <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Мои записи" icon={CalendarDays}><div className="rounded-xl bg-slate-50 p-4"><p className="font-medium text-slate-900">Мария Иванова · Терапевт</p><p className="mt-1 text-sm text-slate-500">12 ноября 2026 · 10:00</p><p className="mt-3 inline-flex rounded-full bg-teal-50 px-2.5 py-1 text-xs text-teal-800">Подтверждена</p></div><p className="mt-4 text-sm text-slate-500">Стоимость приёма: <strong className="text-slate-800">8 000 ₸</strong></p></Panel>
      <Panel title="Записаться на приём" icon={ClipboardList}><label className="grid gap-2 text-sm font-medium">Услуга<select value={service} onChange={(e) => setService(e.target.value)} className="min-h-11 rounded-lg border border-slate-200 bg-white px-3">{services.map((s) => <option key={s.name}>{s.name}</option>)}</select></label><p className="mt-2 text-sm text-slate-500">{services.find((s) => s.name === service)?.duration} · {services.find((s) => s.name === service)?.price}</p><div className="mt-4 flex flex-wrap gap-2">{["09:00", "09:30", "10:00", "10:30", "11:00"].map((slot) => <button key={slot} onClick={() => setTime(slot)} className={`rounded-lg border px-3 py-2 text-sm ${time === slot ? "border-teal-700 bg-teal-50 text-teal-900" : "border-slate-200"}`}>{slot}</button>)}</div><button disabled={!time} onClick={() => setBooked(`${translate(locale, service)}, 12 ноября в ${time}`)} className="mt-4 min-h-11 rounded-lg bg-teal-800 px-4 text-sm font-medium text-white disabled:opacity-50">Подтвердить запись</button>{booked && <p className="mt-3 text-sm text-teal-800" role="status">Вы выбрали: {booked}</p>}</Panel>
      <Panel title="Услуги и стоимость" icon={Wallet}><ul className="divide-y divide-slate-100">{services.map((s) => <li key={s.name} className="flex justify-between gap-3 py-3 text-sm"><span>{s.name}<small className="mt-1 block text-slate-500">{s.duration}</small></span><strong className="whitespace-nowrap">{s.price}</strong></li>)}</ul></Panel>
      <Panel title="Медицинские документы" icon={ClipboardList}><p className="text-sm text-slate-500">Здесь пациент сможет смотреть назначения, результаты обследований и историю посещений.</p></Panel>
    </div>}

    {role === "doctor" && <div className="grid gap-5 lg:grid-cols-2"><Panel title="Расписание на сегодня" icon={CalendarDays}><ul className="divide-y divide-slate-100">{[["09:00", "Айжан Садыкова", "Первичная консультация"], ["10:00", "Данияр Омаров", "Повторная консультация"], ["11:30", "Свободно", "Окно для записи"]].map(([t, n, detail]) => <li key={t} className="flex gap-4 py-3 text-sm"><strong>{t}</strong><span>{n}<small className="mt-1 block text-slate-500">{detail}</small></span></li>)}</ul></Panel><Panel title="Мои пациенты" icon={Users}><p className="text-3xl font-semibold">24</p><p className="text-sm text-slate-500">пациента за этот месяц</p><div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">Ближайший приём: сегодня в 09:00</div></Panel><Panel title="Услуги и стоимость" icon={Wallet}><ul className="divide-y divide-slate-100">{services.map((s) => <li key={s.name} className="flex justify-between py-3 text-sm"><span>{s.name}</span><strong>{s.price}</strong></li>)}</ul></Panel><Panel title="Отзывы пациентов" icon={HeartPulse}><p className="text-3xl font-semibold">4,9 <span className="text-amber-500">★</span></p><p className="mt-1 text-sm text-slate-500">На основе 38 отзывов</p><p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">«Врач внимательно выслушала и всё подробно объяснила.»</p></Panel></div>}

    {role === "admin" && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{([["Пациенты", "128", Users], ["Врачи", "12", Stethoscope], ["Записи сегодня", "18", CalendarDays], ["Выручка за месяц", "1 240 000 ₸", Wallet]] as const).map(([label, value, Icon]) => <section key={label as string} className="rounded-2xl border border-slate-200 bg-white p-5"><Icon size={20} className="mb-4 text-teal-700" /><p className="text-sm text-slate-500">{label as string}</p><p className="mt-2 text-2xl font-semibold text-slate-900">{value as string}</p></section>)}<div className="sm:col-span-2 lg:col-span-4"><Panel title="Последние записи" icon={ClipboardList}><div className="overflow-x-auto"><table className="w-full min-w-[540px] text-left text-sm"><thead className="text-xs text-slate-500"><tr><th className="pb-3">Пациент</th><th>Врач</th><th>Дата</th><th>Услуга</th><th>Стоимость</th></tr></thead><tbody className="divide-y divide-slate-100">{[["Айжан Садыкова", "М. Иванова", "12 ноя, 10:00", "Консультация", "8 000 ₸"], ["Данияр Омаров", "М. Иванова", "12 ноя, 10:30", "Повторный приём", "6 000 ₸"]].map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell} className="py-3">{cell}</td>)}</tr>)}</tbody></table></div></Panel></div></div>}

    <p className="mt-8 text-xs text-slate-500">Демонстрационные сведения. Для настоящих аккаунтов, медицинских карт и платежей потребуется подключить серверную базу данных и авторизацию.</p>
  </main></LocalizedContent>;
}
