import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medica — управление клиникой",
  description: "Учебная система управления клиникой: пациенты, врачи и записи на приём. Интерфейс на Tailwind CSS без бэкенда.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
