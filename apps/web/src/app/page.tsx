"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex max-w-lg flex-col items-center gap-6 text-center"
      >
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl">
          LingoFlow AI
        </h1>
        <p className="text-balance text-slate-600 dark:text-slate-300">
          Tutor de idiomas con conversación, tareas y hojas PDF — impulsado por
          Groq y Supabase.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/login"
              className="inline-block rounded-2xl border border-slate-300 bg-white px-8 py-3 font-semibold text-slate-900 shadow-md transition-colors hover:border-primary hover:text-primary dark:border-slate-600 dark:bg-surface-elevated dark:text-white dark:hover:border-primary"
            >
              Entrar
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/chat"
              className="inline-block rounded-2xl bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/25"
            >
              Ir al chat
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
