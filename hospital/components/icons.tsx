import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function icon(paths: string[]) {
  return function Icon({ size = 18, strokeWidth = 1.5, ...props }: IconProps) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths.map((path, index) => <path key={index} d={path} />)}</svg>;
  };
}

export const Plus = icon(["M12 5v14M5 12h14"]);
export const X = icon(["m6 6 12 12M6 18 18 6"]);
export const ArrowRight = icon(["M4 12h16m-6-6 6 6-6 6"]);
export const ArrowUpRight = icon(["M6 18 18 6M6 6h12v12"]);
export const Search = icon(["M21 21l-5-5", "M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0"]);
export const Pencil = icon(["m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z"]);
export const Trash2 = icon(["M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"]);
export const CalendarDays = icon(["M4 5h16v16H4ZM8 3v4m8-4v4M4 10h16M8 14h1m6 0h1m-8 3h1m6 0h1"]);
export const CalendarPlus = icon(["M4 5h16v7M4 5v16h8M8 3v4m8-4v4M4 10h16M18 14v8m-4-4h8"]);
export const HeartPulse = icon(["M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z", "M3 12h4l2-4 4 8 2-4h6"]);
export const Activity = icon(["M2 12h5l3-9 4 18 3-9h5"]);
export const LayoutDashboard = icon(["M3 3h7v7H3ZM14 3h7v4h-7ZM14 11h7v10h-7ZM3 14h7v7H3Z"]);
export const Users = icon(["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.9", "M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0m4-3.9a4 4 0 0 1 0 7.8"]);
export const Stethoscope = icon(["M5 3v6a5 5 0 0 0 10 0V3M3 3h4m6 0h4M10 14v2a5 5 0 0 0 10 0v-3", "M22 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0"]);
export const CircleHelp = icon(["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0", "M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4m.1 3h.01"]);
export const PanelLeftOpen = icon(["M3 3h18v18H3ZM8 3v18m4-13 4 4-4 4"]);
export const PanelLeftClose = icon(["M3 3h18v18H3ZM8 3v18m8-13-4 4 4 4"]);
export const Clock = icon(["M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M12 6v6l4 2"]);
export const Check = icon(["m5 12 4 4L19 6"]);
export const UserRound = icon(["M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21a8 8 0 0 1 16 0"]);
export const Mail = icon(["M3 5h18v14H3ZM3 5l9 7 9-7"]);
export const Phone = icon(["M5 3h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2Z"]);
export const ClipboardList = icon(["M9 4H5v17h14V4h-4M9 2h6v4H9ZM8 11h.01M11 11h5M8 16h.01M11 16h5"]);
export const Wallet = icon(["M3 6V4h16v3M3 6v14h18V7H5a2 2 0 0 1-2-1ZM16 11h5v5h-5ZM17 13.5h.01"]);
export const ChevronUpDown = icon(["m8 8 4-4 4 4m-8 8 4 4 4-4"]);
