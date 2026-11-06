"use client";

import { useState, type FormEvent } from "react";
import { Mail, Phone, UserRound } from "@/components/icons";
import { styles } from "./shared";
import { profileInitials, type UserProfile } from "../clinic-shell";

export function ProfileSection({ profile, onSave }: { profile: UserProfile; onSave: (profile: UserProfile) => void }) {
  const [draft, setDraft] = useState(profile);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = { ...draft, name: draft.name.trim(), role: draft.role.trim(), email: draft.email.trim(), phone: draft.phone.trim() };
    if (!next.name || !next.role) {
      setError("Укажите имя и должность.");
      return;
    }
    if (next.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) {
      setError("Проверьте адрес электронной почты.");
      return;
    }
    setError("");
    onSave(next);
  }

  return (
    <section className="max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-lg font-medium text-slate-900">Личные данные</h2>
        <p className="mt-1 text-sm text-slate-500">Эти сведения отображаются в рабочем пространстве клиники.</p>
      </div>
      <form onSubmit={submit} className="space-y-6 p-6">
        <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
          <span className="grid size-14 place-items-center rounded-full bg-teal-100 text-lg font-semibold text-teal-800"><UserRound size={24} aria-hidden="true" /></span>
          <div><p className="font-medium text-slate-900">{draft.name || "Ваше имя"}</p><p className="text-sm text-slate-500">{draft.role || "Должность"}</p></div>
          <span className="sr-only">Инициалы: {profileInitials(draft.name)}</span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">Имя и фамилия
            <input className={`${styles.field} w-full`} autoComplete="name" maxLength={80} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Должность
            <input className={`${styles.field} w-full`} maxLength={60} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} required />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700"><span className="flex items-center gap-2"><Mail size={15} aria-hidden="true" />Электронная почта</span>
            <input className={`${styles.field} w-full`} type="email" autoComplete="email" maxLength={120} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700"><span className="flex items-center gap-2"><Phone size={15} aria-hidden="true" />Телефон</span>
            <input className={`${styles.field} w-full`} type="tel" autoComplete="tel" maxLength={30} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
          </label>
        </div>
        {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
        <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5">
          <button type="submit" className={styles.primary}>Сохранить профиль</button>
          <p className="text-xs text-slate-500">Профиль хранится в локальном браузере.</p>
        </div>
      </form>
    </section>
  );
}
