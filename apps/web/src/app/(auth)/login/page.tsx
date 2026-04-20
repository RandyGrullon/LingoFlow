"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <main className="mx-auto flex max-w-md flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Acceso</h1>
      <p className="text-sm text-slate-500">
        Usa email y contraseña de tu proyecto Supabase.
      </p>
      <input
        type="email"
        className="rounded-xl border border-slate-600 bg-transparent px-3 py-2 dark:border-slate-300"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="rounded-xl border border-slate-600 bg-transparent px-3 py-2 dark:border-slate-300"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <button
        type="button"
        disabled={loading}
        onClick={() => void submit()}
        className="rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-50"
      >
        {mode === "signin" ? "Entrar" : "Crear cuenta"}
      </button>
      <button
        type="button"
        className="text-sm text-slate-500 underline"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin"
          ? "¿Sin cuenta? Regístrate"
          : "¿Ya tienes cuenta? Entra"}
      </button>
      <Link href="/" className="text-center text-sm text-slate-500">
        Volver al inicio
      </Link>
    </main>
  );
}
