"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Mode = "signin" | "signup";

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconAlert({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

function IconEye({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <path d="m1 1 22 22" />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
      aria-hidden
    />
  );
}

export function LoginRegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    const sb = createClient();
    try {
      if (mode === "signup") {
        const { error: e } = await sb.auth.signUp({ email: email.trim(), password });
        if (e) throw e;
      } else {
        const { error: e } = await sb.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (e) throw e;
      }
      router.replace("/chat");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de autenticación");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white/95 py-3 pl-11 pr-4 text-[15px] text-slate-900 shadow-sm outline-none ring-primary/0 transition-[box-shadow,border-color] placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/25 dark:border-slate-600/80 dark:bg-slate-950/40 dark:text-white dark:placeholder:text-slate-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-slate-200/90 bg-white/85 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-primary/20 dark:bg-surface-elevated/90 dark:shadow-black/40 sm:p-10"
    >
      <div className="mb-2 flex items-center justify-center gap-2 lg:hidden">
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LingoFlow</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mb-8 text-center lg:text-left"
        >
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[1.65rem]">
            {mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {mode === "signin"
              ? "Introduce tus credenciales para continuar."
              : "Regístrate para guardar tu progreso y sincronizar entre dispositivos."}
          </p>
        </motion.div>
      </AnimatePresence>

      <div
        className="mb-8 flex rounded-xl border border-slate-200/80 bg-slate-100/80 p-1 dark:border-slate-600/50 dark:bg-slate-900/60"
        role="tablist"
        aria-label="Tipo de acceso"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          className={`relative flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            mode === "signin"
              ? "bg-white text-slate-900 shadow-sm dark:bg-surface-card dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
          onClick={() => {
            setMode("signin");
            setError(null);
          }}
        >
          Entrar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          className={`relative flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            mode === "signup"
              ? "bg-white text-slate-900 shadow-sm dark:bg-surface-card dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
          onClick={() => {
            setMode("signup");
            setError(null);
          }}
        >
          Registro
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="auth-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Correo electrónico
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <IconMail className="h-5 w-5" />
            </span>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              className={inputClass}
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label htmlFor="auth-password" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Contraseña
            </label>
            {mode === "signup" ? (
              <span className="text-xs text-slate-500 dark:text-slate-500">Mín. 6 caracteres recomendado</span>
            ) : null}
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <IconLock className="h-5 w-5" />
            </span>
            <input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className={`${inputClass} pr-12`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 overflow-hidden"
          >
            <div className="flex gap-3 rounded-xl border border-red-200/80 bg-red-50/95 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-200">
              <IconAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <p className="leading-snug">{error}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        disabled={loading || !email.trim() || !password}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        onClick={() => void submit()}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-primary/30 transition-[opacity,box-shadow] hover:bg-primary-dark disabled:pointer-events-none disabled:opacity-45 dark:shadow-primary/20"
      >
        {loading ? (
          <>
            <Spinner />
            <span>Procesando…</span>
          </>
        ) : mode === "signin" ? (
          "Continuar"
        ) : (
          "Crear mi cuenta"
        )}
      </motion.button>

      <p className="mt-8 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-500">
        Al continuar, aceptas el uso de tu cuenta según la configuración de autenticación de tu proyecto.
      </p>

      <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-200/80 pt-6 dark:border-slate-700/80">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary-muted"
        >
          <span aria-hidden>←</span> Volver al inicio
        </Link>
      </div>
    </motion.div>
  );
}
