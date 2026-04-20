"use client";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    return <p className="p-4">Cargando…</p>;
  }

  const p = data?.profile;
  const l = data?.learning;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Perfil de aprendizaje</h1>
      {p ? (
        <section className="rounded-2xl border border-slate-700 p-4 dark:border-slate-200">
          <p className="text-sm text-slate-500">Idiomas</p>
          <p>
            {p.native_language} → {p.target_language}
          </p>
          <p className="mt-2 text-sm">
            Nivel CEFR: <strong>{p.cefr_level}</strong>
          </p>
        </section>
      ) : (
        <p className="text-sm text-slate-500">Sin perfil aún. Chatea para crearlo.</p>
      )}
      {l ? (
        <section className="rounded-2xl border border-slate-700 p-4 dark:border-slate-200">
          <p className="text-lg font-semibold text-brand">{l.total_xp} XP</p>
          <p className="text-sm">Racha: {l.streak_days} días</p>
          <p className="mt-2 text-sm">
            Dificultad: {Number(l.difficulty_score).toFixed(2)}×
          </p>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Fortalezas
            </p>
            <ul className="list-inside list-disc text-sm">
              {(l.strengths ?? []).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Debilidades
            </p>
            <ul className="list-inside list-disc text-sm">
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
          className="text-brand underline"
        >
          Ir al chat
        </Link>
      </div>
    </div>
  );
}
