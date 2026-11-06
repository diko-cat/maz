import type { ReactNode } from "react";
import { Search } from "@/components/icons";

export const styles = {
  primary: "inline-flex items-center justify-center gap-2 min-h-11 rounded-lg bg-teal-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600",
  secondary: "inline-flex items-center justify-center gap-2 min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50",
  panel: "min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]",
  field: "min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100",
  link: "flex items-center gap-2 min-h-11 text-sm font-medium text-teal-800 hover:text-teal-900",
};

export const avatarColors = [
  "bg-teal-50 text-teal-700",
  "bg-indigo-50 text-indigo-700",
  "bg-orange-50 text-orange-800",
  "bg-sky-50 text-sky-700",
];

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="px-6 py-14 text-center text-sm text-slate-500">{children}</div>;
}

export function PanelHeading({ title, description, children }: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
      <div>
        <h2 className="text-lg font-medium text-slate-900">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function SearchField({ placeholder, query, onQueryChange }: {
  placeholder: string;
  query: string;
  onQueryChange: (query: string) => void;
}) {
  return (
    <div className="relative min-w-0 basis-52 flex-1">
      <Search size={18} className="pointer-events-none absolute top-3 left-3 text-slate-400" />
      <input
        aria-label={placeholder}
        type="search"
        name="search"
        autoComplete="off"
        className={`${styles.field} w-full pl-10`}
        placeholder={placeholder}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
    </div>
  );
}
