"use client";

import "./globals.css";
import { ThemeProvider } from "next-themes";
import { useEffect }     from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Apply saved font size on mount
  useEffect(() => {
    const saved = localStorage.getItem("fontSize") ?? "md";
    document.documentElement.setAttribute("data-font-size", saved);
  }, []);

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)"  content="#0c0c0e" />
        <meta name="application-name" content="Alkitab GKPB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Alkitab" />
        <meta name="description" content="Alkitab Bahasa Indonesia — TB, BIS, TL" />
        <link rel="manifest" href="/manifest.json" />
        <title>Alkitab GKPB</title>
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
