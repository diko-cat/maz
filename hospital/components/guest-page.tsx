"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Check, Clock, HeartPulse, Stethoscope } from "@/components/icons";
import { LanguageSwitcher, LocaleProvider, LocalizedContent, useLocale } from "@/components/locale-provider";
import { localeTags } from "@/lib/i18n";

interface Service { id: string; name: string; price: number; durationMinutes: number }
interface Doctor { fullName: string; specialization: string; experienceYears: number; rating: number; biography: string }
interface Schedule { slots: { time: string; status: "available" | "occupied" }[] }
type Notice = { kind: "success" | "error" | "info"; message: string } | null;

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");
const demoServices: Service[] = [
  { id: "consultation", name: "Первичная консультация терапевта", price: 8000, durationMinutes: 30 },
  { id: "follow-up", name: "Повторная консультация", price: 6000, durationMinutes: 30 },
  { id: "checkup", name: "Профилактический осмотр", price: 10000, durationMinutes: 60 },
];
const demoDoctor: Doctor = { fullName: "Иванова Мария Сергеевна", specialization: "Терапевт", experienceYears: 12, rating: 4.9, biography: "" };
const demoTimes = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

function localDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

async function loadSchedule(date: string): Promise<Schedule> {
  const response = await fetch(`${apiBase}/schedule?date=${encodeURIComponent(date)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("schedule");
  return response.json() as Promise<Schedule>;
}

export default function GuestPage() {
  return <LocaleProvider><GuestPageContent /></LocaleProvider>;
}

function GuestPageContent() {
  const { locale } = useLocale();
  const [today, setToday] = useState("");
  const [services, setServices] = useState(demoServices);
  const [doctor, setDoctor] = useState(demoDoctor);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState(demoTimes);
  const [serviceId, setServiceId] = useState(demoServices[0].id);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const selectedService = services.find((service) => service.id === serviceId) ?? services[0];

  useEffect(() => setToday(localDate()), []);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`${apiBase}/services`, { cache: "no-store" }).then((response) => {
        if (!response.ok) throw new Error("services");
        return response.json() as Promise<Service[]>;
      }),
      fetch(`${apiBase}/doctor`, { cache: "no-store" }).then((response) => {
        if (!response.ok) throw new Error("doctor");
        return response.json() as Promise<Doctor>;
      }),
    ]).then(([nextServices, nextDoctor]) => {
      if (!active) return;
      if (nextServices.length) {
        setServices(nextServices);
        setServiceId((current) => nextServices.some((service) => service.id === current) ? current : nextServices[0].id);
      }
      setDoctor(nextDoctor);
      setApiAvailable(true);
    }).catch(() => { if (active) setApiAvailable(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!date) return;
    setTime("");
    setNotice(null);
    if (apiAvailable !== true) { setSlots(demoTimes); return; }
    let active = true;
    loadSchedule(date).then((schedule) => {
      if (active) setSlots(schedule.slots.filter((slot) => slot.status === "available").map((slot) => slot.time));
    }).catch(() => {
      if (!active) return;
      setApiAvailable(false);
      setSlots(demoTimes);
    });
    return () => { active = false; };
  }, [apiAvailable, date]);

  async function submitAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    if (apiAvailable !== true) {
      setNotice({ kind: "info", message: "Сервер онлайн-записи сейчас недоступен. Запись не отправлена; попробуйте позже." });
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientName: name, phone, serviceId, date, time }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        if (response.status === 409) {
          setNotice({ kind: "error", message: "Это время только что заняли. Выберите другой свободный слот." });
          setTime("");
          try {
            const schedule = await loadSchedule(date);
            setSlots(schedule.slots.filter((slot) => slot.status === "available").map((slot) => slot.time));
          } catch { setApiAvailable(false); }
        } else setNotice({ kind: "error", message: result?.error ?? "Не удалось отправить запись. Проверьте данные и попробуйте ещё раз." });
        return;
      }
      setNotice({ kind: "success", message: "Запись подтверждена. Ждём вас в клинике!" });
      setTime("");
      try {
        const schedule = await loadSchedule(date);
        setSlots(schedule.slots.filter((slot) => slot.status === "available").map((slot) => slot.time));
      } catch { setApiAvailable(false); }
    } catch {
      setApiAvailable(false);
      setNotice({ kind: "info", message: "Не удалось связаться с сервером. Запись не отправлена; попробуйте позже." });
    } finally { setSubmitting(false); }
  }

  const price = selectedService
    ? new Intl.NumberFormat(localeTags[locale], { style: "currency", currency: "KZT", maximumFractionDigits: 0 }).format(selectedService.price)
    : "";

  return <LocalizedContent><div className="min-h-screen bg-[#f4f7f6] text-slate-800">
    <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-8">
      <Link href="/guest" aria-label="maz — главная страница для гостей" className="inline-flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-950">
        <span className="grid size-10 place-items-center rounded-xl bg-teal-800 text-white"><HeartPulse size={23} /></span><span>maz<span className="text-teal-700">.</span></span>
      </Link>
      <nav className="flex flex-wrap items-center gap-2 sm:gap-4" aria-label="Навигация по странице">
        <a href="#services" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-teal-800 sm:inline-flex">Услуги</a>
        <Link href="/portal?role=patient" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-teal-800">Кабинет пациента</Link>
        <Link href="/" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-teal-800 sm:inline-flex">Для сотрудников</Link>
        <LanguageSwitcher />
      </nav>
    </header>

    <main className="mx-auto max-w-7xl px-4 pb-12 sm:px-8">
      <section className="grid items-center gap-8 py-8 lg:grid-cols-[1fr_0.9fr] lg:gap-14 lg:py-12">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-800/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-teal-900"><span className="size-2 rounded-full bg-teal-600" />Клиника рядом</p>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Здоровье начинается с внимательного приёма</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">Выберите услугу и удобное время. Записаться можно без регистрации — мы будем рады помочь.</p>
          <a href="#booking" className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-xl bg-teal-800 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900">Записаться на приём <ArrowRight size={17} /></a>
          <div className="mt-10 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex sm:items-center sm:gap-5">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-800"><Stethoscope size={25} /></div>
            <div className="mt-4 min-w-0 sm:mt-0"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Ваш специалист</p><h2 className="mt-1 text-lg font-semibold text-slate-950">{doctor.fullName}</h2><p className="mt-1 text-sm text-slate-600">{doctor.specialization} · {doctor.experienceYears} лет опыта</p></div>
            <div className="mt-4 flex shrink-0 items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 sm:ml-auto sm:mt-0"><span aria-hidden="true">★</span>{doctor.rating.toFixed(1)}</div>
          </div>
        </div>

        <section id="booking" className="scroll-mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-42px_rgba(15,118,110,0.34)] sm:p-7" aria-labelledby="booking-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-800">Онлайн-запись</p><h2 id="booking-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Выберите время</h2></div>
            <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${apiAvailable === true ? "bg-emerald-50 text-emerald-800" : apiAvailable === false ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
              {apiAvailable === true ? "Актуальное расписание" : apiAvailable === false ? "Демо-расписание" : "Загружаем расписание…"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">Заполните контакты — запись не требует создания аккаунта.</p>

          <form className="mt-6 space-y-4" onSubmit={submitAppointment}>
            <label className="form-field">Услуга
              <select required value={serviceId} onChange={(event) => setServiceId(event.target.value)}>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select>
            </label>
            {selectedService && <p className="-mt-2 flex items-center gap-2 text-xs text-slate-500"><Clock size={14} />{selectedService.durationMinutes} минут <span className="text-slate-300">·</span>{price}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="form-field">Дата приёма<input required type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} /></label>
              <div className="form-field"><span>Свободное время</span><div className="flex min-h-11 flex-wrap gap-2" aria-label="Доступное время">
                {slots.length ? slots.map((slot) => <button key={slot} type="button" aria-pressed={time === slot} onClick={() => { setTime(slot); setNotice(null); }} className={`min-h-10 rounded-lg border px-3 text-sm transition-colors ${time === slot ? "border-teal-800 bg-teal-800 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-teal-700 hover:bg-teal-50"}`}>{slot}</button>) : <span className="py-2 text-xs font-normal text-slate-500">На эту дату нет свободного времени.</span>}
              </div></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="form-field">Ваше имя<input required maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Имя и фамилия" /></label>
              <label className="form-field">Номер телефона<input required type="tel" maxLength={20} autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+7 (___) ___-__-__" pattern="\+?[\d\s()-]{7,20}" /></label>
            </div>
            <button disabled={!date || !time || submitting || apiAvailable === null} type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-800 px-5 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-slate-300">
              {submitting ? "Отправляем…" : "Подтвердить запись"}<ArrowRight size={17} />
            </button>
            {notice && <p role={notice.kind === "error" ? "alert" : "status"} className={`rounded-lg border px-3 py-3 text-sm leading-5 ${notice.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : notice.kind === "error" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{notice.message}</p>}
            {apiAvailable === false && <p className="text-xs leading-5 text-slate-500">Для отправки записи нужно запустить сервер API. Сейчас отображается пример расписания.</p>}
          </form>
        </section>
      </section>

      <section id="services" className="border-t border-slate-200 py-10 sm:py-14" aria-labelledby="services-title">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-800">Понятно и прозрачно</p><h2 id="services-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Услуги клиники</h2></div><p className="max-w-sm text-sm leading-6 text-slate-500">Стоимость и продолжительность приёма видны заранее — никаких сюрпризов.</p></div>
        <div className="grid gap-4 md:grid-cols-3">{services.map((service) => <article key={service.id} className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"><span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-800"><HeartPulse size={20} /></span><h3 className="mt-5 font-semibold leading-6 text-slate-950">{service.name}</h3><div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm"><span className="text-slate-500">{service.durationMinutes} минут</span><strong className="whitespace-nowrap text-slate-900">{new Intl.NumberFormat(localeTags[locale], { style: "currency", currency: "KZT", maximumFractionDigits: 0 }).format(service.price)}</strong></div></article>)}</div>
      </section>

      <section className="flex flex-col gap-5 rounded-3xl bg-slate-950 px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:px-9 sm:py-8">
        <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-teal-200"><Check size={22} /></span><div><h2 className="text-xl font-semibold">Мы рядом, когда нужна забота</h2><p className="mt-1 text-sm leading-6 text-slate-300">Выберите время для визита — это займёт всего пару минут.</p></div></div>
        <a href="#booking" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-teal-200">К записи <ArrowRight size={16} /></a>
      </section>
      <footer className="flex flex-wrap items-center justify-between gap-3 py-7 text-xs text-slate-500"><span>© 2026 maz · Забота в каждом действии</span><span>Демонстрационная клиника</span></footer>
    </main>
  </div></LocalizedContent>;
}
