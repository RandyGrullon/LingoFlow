"use client";

import { InstallPwaButton } from "@/components/pwa/InstallPwaButton";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { accessToken, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || accessToken) return;
    const protectedPrefixes = ["/chat", "/profile", "/lessons", "/tasks"];
    const isProtected = protectedPrefixes.some((p) => pathname?.startsWith(p));
    if (isProtected) router.replace("/login");
  }, [loading, accessToken, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="text-sm font-medium text-primary"
        >
          Cargando…
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <motion.header
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 border-b border-primary/15 bg-surface-elevated/85 px-4 py-3 shadow-md shadow-black/20 backdrop-blur-md dark:border-primary/25"
      >
        <Link
          href="/"
          className="font-bold tracking-tight text-primary transition-transform hover:scale-105"
        >
          LingoFlow
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
          <Link
            href="/chat"
            className="rounded-lg px-2 py-1 transition-colors hover:bg-primary/10 hover:text-primary"
          >
            Chat
          </Link>
          <Link
            href="/lessons"
            className="rounded-lg px-2 py-1 transition-colors hover:bg-primary/10 hover:text-primary"
          >
            Lecciones
          </Link>
          <Link
            href="/profile"
            className="rounded-lg px-2 py-1 transition-colors hover:bg-primary/10 hover:text-primary"
          >
            Perfil
          </Link>
          <InstallPwaButton />
          {accessToken ? (
            <button
              type="button"
              className="text-muted-fg underline transition-colors hover:text-primary"
              onClick={() => void signOut()}
            >
              Salir
            </button>
          ) : (
            <Link
              href="/login"
              className="font-medium text-primary underline transition-colors hover:text-primary-dark"
            >
              Entrar
            </Link>
          )}
        </nav>
      </motion.header>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}
