import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { PageTransition } from "@/components/layout/PageTransition";

export const metadata: Metadata = {
  title: "LingoFlow AI",
  description: "Tutor de idiomas con IA — PWA",
  appleWebApp: { capable: true, title: "LingoFlow" },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-app-gradient antialiased transition-colors duration-300">
        <AuthProvider>
          <PageTransition>{children}</PageTransition>
        </AuthProvider>
      </body>
    </html>
  );
}
