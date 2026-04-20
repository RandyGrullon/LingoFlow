"use client";

import type { ReactNode } from "react";

function BackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-app-gradient opacity-90" />
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.25]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute -right-20 top-0 h-[min(50vh,28rem)] w-[min(90vw,28rem)] rounded-full bg-primary/25 blur-3xl dark:bg-primary/20" />
      <div className="absolute -left-16 bottom-0 h-[min(45vh,24rem)] w-[min(85vw,24rem)] rounded-full bg-sky-500/15 blur-3xl dark:bg-sky-400/10" />
      <div className="absolute left-1/2 top-1/3 h-px w-[120%] -translate-x-1/2 rotate-[-8deg] bg-gradient-to-r from-transparent via-primary/20 to-transparent dark:via-primary/30" />
    </div>
  );
}

function SparklesGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 2l1.09 4.26L17 7.5l-3.91 1.24L12 13l-1.09-4.26L7 7.5l3.91-1.24L12 2z"
        className="fill-primary"
        opacity="0.9"
      />
      <path
        d="M19 13l.68 2.64L22 16.5l-2.32.74L19 20l-.68-2.64L16 16.5l2.32-.74L19 13z"
        className="fill-sky-400 dark:fill-sky-300"
        opacity="0.85"
      />
      <path
        d="M5 15l.55 2.14L7.5 17.5l-1.95.62L5 21l-.55-2.14L2.5 17.5l1.95-.62L5 15z"
        className="fill-primary"
        opacity="0.6"
      />
    </svg>
  );
}

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full">
      <BackgroundDecor />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row lg:items-stretch">
        <aside className="relative hidden flex-col justify-center px-10 py-16 lg:flex lg:w-[46%] xl:px-16">
          <div className="max-w-md">
            <div className="mb-8 flex items-center gap-3">
              <SparklesGlyph className="h-10 w-10 shrink-0" />
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                LingoFlow
              </span>
            </div>
            <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white xl:text-4xl">
              Tu espacio para practicar idiomas con IA
            </h2>
            <p className="mt-5 text-balance text-base leading-relaxed text-slate-600 dark:text-slate-400">
              Conversación natural, tareas guiadas y seguimiento del progreso — todo en un solo lugar.
            </p>
            <ul className="mt-10 space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  ✓
                </span>
                <span>Chat con feedback instantáneo</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  ✓
                </span>
                <span>Tareas adaptadas a tu nivel</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  ✓
                </span>
                <span>Sincronizado con tu cuenta Supabase</span>
              </li>
            </ul>
          </div>
        </aside>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8 lg:py-16">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
