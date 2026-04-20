import Link from "next/link";

export default function LessonsPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Lecciones
      </h1>
      <p className="text-sm text-muted-fg">
        Las lecciones generadas por IA aparecerán aquí. Por ahora, genera tareas
        desde el chat o desde el perfil.
      </p>
      <Link
        href="/chat"
        className="font-medium text-primary underline transition-colors hover:text-primary-dark"
      >
        Ir al chat
      </Link>
    </div>
  );
}
