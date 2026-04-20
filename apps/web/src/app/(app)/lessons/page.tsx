import Link from "next/link";

export default function LessonsPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Lecciones</h1>
      <p className="text-sm text-slate-500">
        Las lecciones generadas por IA aparecerán aquí. Por ahora, genera tareas
        desde el chat o desde el perfil.
      </p>
      <Link href="/chat" className="text-brand underline">
        Ir al chat
      </Link>
    </div>
  );
}
