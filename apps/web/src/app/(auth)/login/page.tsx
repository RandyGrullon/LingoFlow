"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    const sb = createClient();
    try {
      if (mode === "signup") {
        const { error: e } = await sb.auth.signUp({ email, password });
        if (e) throw e;
      } else {
        const { error: e } = await sb.auth.signInWithPassword({ email, password });
        if (e) throw e;
      }
      router.replace("/chat");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de autenticación");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-5 p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl border border-primary/20 bg-surface-elevated/60 p-6 shadow-xl shadow-black/20 backdrop-blur-sm dark:bg-surface-elevated/80"
      >
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Acceso</h1>
        <p className="mt-2 text-sm text-muted-fg">
          Usa email y contraseña de tu proyecto Supabase.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-inner outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-slate-600 dark:bg-slate-950/50 dark:text-white"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-inner outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-slate-600 dark:bg-slate-950/50 dark:text-white"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        <motion.button
          type="button"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          onClick={() => void submit()}
          className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-opacity disabled:opacity-50"
        >
          {mode === "signin" ? "Entrar" : "Crear cuenta"}
        </motion.button>
        <button
          type="button"
          className="mt-4 w-full text-sm text-muted-fg underline transition-colors hover:text-primary"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin"
            ? "¿Sin cuenta? Regístrate"
            : "¿Ya tienes cuenta? Entra"}
        </button>
      </motion.div>
      <Link
        href="/"
        className="text-center text-sm text-muted-fg transition-colors hover:text-primary"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
