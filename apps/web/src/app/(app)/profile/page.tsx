"use client";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ProfilePayload {
  profile: {
    id: string;
    display_name: string | null;
    native_language: string;
    target_language: string;
    cefr_level: string;
  } | null;
  learning: {
    total_xp: number;
    streak_days: number;
    strengths: string[];
    weaknesses: string[];
    difficulty_score: number;
  } | null;
}

export default function ProfilePage() {
  const { accessToken, loading } = useAuth();
  const [data, setData] = useState<ProfilePayload | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    void (async () => {
      const res = await apiFetch("/profile", accessToken);
      if (res.ok) setData((await res.json()) as ProfilePayload);
    })();
  }, [accessToken]);

  if (loading || !accessToken) {
    return (
      <p className="p-4 text-muted-fg motion-safe:animate-pulse">Cargando…</p>
    );
  }

  const p = data?.profile;
  const l = data?.learning;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg space-y-6"
    >
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Perfil de aprendizaje
      </h1>
      {p ? (
        <section className="rounded-2xl border border-primary/20 bg-surface-elevated/60 p-5 shadow-lg shadow-black/10 backdrop-blur-sm dark:bg-surface-elevated/80">
          <p className="text-sm text-muted-fg">Idiomas</p>
          <p className="text-slate-900 dark:text-white">
            {p.native_language} → {p.target_language}
          </p>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
            Nivel CEFR: <strong className="text-primary">{p.cefr_level}</strong>
          </p>
        </section>
      ) : (
        <p className="text-sm text-muted-fg">
          Sin perfil aún. Chatea para crearlo.
        </p>
      )}
      {l ? (
        <section className="rounded-2xl border border-primary/20 bg-surface-elevated/60 p-5 shadow-lg shadow-black/10 backdrop-blur-sm dark:bg-surface-elevated/80">
          <p className="text-lg font-semibold text-primary">{l.total_xp} XP</p>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            Racha: {l.streak_days} días
          </p>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
            Dificultad: {Number(l.difficulty_score).toFixed(2)}×
          </p>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase text-muted-fg">
              Fortalezas
            </p>
            <ul className="list-inside list-disc text-sm text-slate-800 dark:text-slate-200">
              {(l.strengths ?? []).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase text-muted-fg">
              Debilidades
            </p>
            <ul className="list-inside list-disc text-sm text-slate-800 dark:text-slate-200">
              {(l.weaknesses ?? []).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
      <div>
        <Link
          href="/chat"
          className="font-medium text-primary underline transition-colors hover:text-primary-dark"
        >
          Ir al chat
        </Link>
      </div>
    </motion.div>
  );
}
