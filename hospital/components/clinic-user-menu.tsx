"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, ChevronUpDown, Stethoscope, UserRound, Users } from "./icons";
import { initials } from "@/lib/format";
import { LocalizedContent } from "./locale-provider";
import type { UserProfile } from "./clinic-shell";

const destinations = [
  { role: "patient", label: "Кабинет пациента", detail: "Записи и услуги", icon: UserRound },
  { role: "doctor", label: "Кабинет врача", detail: "Расписание и пациенты", icon: Stethoscope },
  { role: "admin", label: "Кабинет администратора", detail: "Обзор работы клиники", icon: Users },
] as const;

export function ClinicUserMenu({ profile, onProfile }: { profile: UserProfile; onProfile: () => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  function handleKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  return (
    <LocalizedContent><div ref={rootRef} className="relative mt-4" onKeyDown={handleKeyboard} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Меню пользователя: ${profile.name}`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
        className={`flex min-h-16 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-150 focus-visible:outline-teal-200 active:bg-white/15 ${open ? "bg-white/10" : "hover:bg-white/5"}`}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-medium text-teal-200">{initials(profile.name).toLocaleUpperCase("ru") || "А"}</span>
        <span className="min-w-0 flex-1"><strong className="block truncate text-sm font-medium text-white">{profile.name}</strong><span className="block truncate text-xs text-slate-400">{profile.role}</span></span>
        <ChevronUpDown size={16} className="shrink-0 text-slate-400" />
      </button>
      {open && (
        <nav id={menuId} aria-label="Кабинеты пользователя" className="absolute inset-x-0 bottom-full z-50 mb-2 max-h-[calc(100dvh-112px)] overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-1.5 text-white shadow-xl shadow-black/20">
          <p className="px-3 pb-2 pt-2 text-xs text-slate-400">Перейти в кабинет</p>
          {destinations.map(({ role, label, detail, icon: Icon }) => (
            <Link key={role} href={`/portal?role=${role}`} className="flex min-h-16 items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-white/10 focus-visible:-outline-offset-2 focus-visible:outline-teal-200 active:bg-white/15">
              <Icon className="shrink-0 text-teal-200" />
              <span className="min-w-0 flex-1"><span className="block text-sm leading-snug">{label}</span><span className="mt-1 block text-xs text-slate-400">{detail}</span></span>
              <ArrowUpRight size={14} className="shrink-0 text-slate-400" />
            </Link>
          ))}
          <div className="mt-1 border-t border-white/10 pt-1">
            <button type="button" className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-slate-200 transition-colors duration-150 hover:bg-white/10 focus-visible:-outline-offset-2 focus-visible:outline-teal-200 active:bg-white/15" onClick={() => { setOpen(false); onProfile(); }}><UserRound />Настройки профиля</button>
          </div>
        </nav>
      )}
    </div></LocalizedContent>
  );
}
