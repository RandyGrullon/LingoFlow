"use client";

import { InstallPwaButton } from "@/components/pwa/InstallPwaButton";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

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
        Cargando…
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 px-4 py-3 dark:border-slate-200">
        <Link href="/" className="font-bold text-brand">
          LingoFlow
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/chat" className="hover:underline">
            Chat
          </Link>
          <Link href="/lessons" className="hover:underline">
            Lecciones
          </Link>
          <Link href="/profile" className="hover:underline">
            Perfil
          </Link>
          <InstallPwaButton />
          {accessToken ? (
            <button
              type="button"
              className="text-slate-500 underline"
              onClick={() => void signOut()}
            >
              Salir
            </button>
          ) : (
            <Link href="/login" className="text-brand underline">
              Entrar
            </Link>
          )}
        </nav>
      </header>
      <div className="p-4">{children}</div>
    </div>
  );
}
