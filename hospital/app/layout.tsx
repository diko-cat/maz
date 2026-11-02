import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "maz — управление клиникой",
  description: "Учебная система управления клиникой: пациенты, врачи и записи на приём. "
    + "Интерфейс на Tailwind CSS без бэкенда.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
