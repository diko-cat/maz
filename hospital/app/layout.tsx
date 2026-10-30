import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import "./bootstrap-layer.css";

export const metadata: Metadata = {
  title: "Medica — управление клиникой",
  description: "Учебная система управления клиникой: пациенты, врачи и записи на приём. Три интерфейса на Tailwind CSS, Bootstrap и MUI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
