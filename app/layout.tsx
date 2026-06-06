"use client";

import "./globals.css";
import { ThemeProvider } from "next-themes";
import { useEffect }     from "react";
import { RegisterSW }        from "@/components/RegisterSW";
import { cleanupOldReadYears } from "@/lib/storage";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem("fontSize") ?? "md";
    document.documentElement.setAttribute("data-font-size", saved);
    cleanupOldReadYears();
  }, []);

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)"  content="#09090b" />
        <meta name="application-name"             content="Alkitab GKPB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title"   content="Alkitab" />
        <meta name="description" content="Alkitab Gereja Kristen Protestan di Bali — TB, BIS, TL" />
        <link rel="manifest"         href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <title>Alkitab GKPB</title>
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <RegisterSW />
        </ThemeProvider>
      </body>
    </html>
  );
}