import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold">LingoFlow AI</h1>
      <p className="max-w-md text-center text-slate-600 dark:text-slate-300">
        Tutor de idiomas con conversación, tareas y hojas PDF — impulsado por
        Groq y Supabase.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-xl bg-slate-800 px-6 py-3 text-white dark:bg-slate-200 dark:text-slate-900"
        >
          Entrar
        </Link>
        <Link
          href="/chat"
          className="rounded-xl bg-brand px-6 py-3 font-semibold text-white"
        >
          Ir al chat
        </Link>
      </div>
    </main>
  );
}
