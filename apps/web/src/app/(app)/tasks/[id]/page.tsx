"use client";

import { DragDropTask } from "@/components/tasks/DragDropTask";
import { MatchPairsTask } from "@/components/tasks/MatchPairsTask";
import { MultipleChoiceTask } from "@/components/tasks/MultipleChoiceTask";
import { PdfWorksheetTask } from "@/components/tasks/PdfWorksheetTask";
import { SelectImageTask } from "@/components/tasks/SelectImageTask";
import { VoiceTask } from "@/components/tasks/VoiceTask";
import { WritingTask } from "@/components/tasks/WritingTask";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TaskRow {
  id: string;
  type: string;
  prompt: string;
  payload: Record<string, unknown>;
  status: string;
  score?: number;
  feedback?: string;
}

export default function TaskPage() {
  const params = useParams<{ id: string }>();
  const { accessToken, loading: authLoading } = useAuth();
  const [task, setTask] = useState<TaskRow | null>(null);
  const [result, setResult] = useState<{ score: number; feedback: string } | null>(
    null,
  );
  const [worksheetUrl, setWorksheetUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) return;
    void (async () => {
      const res = await apiFetch(`/tasks/${params.id}`, accessToken);
      if (!res.ok) return;
      const t = (await res.json()) as TaskRow;
      setTask(t);
      if (t.type === "pdf_worksheet") {
        const gen = await apiFetch("/files/worksheet/generate", accessToken, {
          method: "POST",
          body: JSON.stringify({ taskId: t.id }),
        });
        if (gen.ok) {
          const j = (await gen.json()) as { url?: string };
          if (j.url) setWorksheetUrl(j.url);
        }
      }
    })();
  }, [accessToken, params.id]);

  async function submit(answer: unknown) {
    if (!accessToken || !task) return;
    const res = await apiFetch(`/tasks/${task.id}/submit`, accessToken, {
      method: "POST",
      body: JSON.stringify({ answer }),
    });
    if (!res.ok) return;
    const j = (await res.json()) as { score: number; feedback: string };
    setResult(j);
  }

  if (authLoading || !accessToken) {
    return <p className="p-4">Cargando…</p>;
  }
  if (!task) {
    return <p className="p-4">Tarea no encontrada</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link href="/profile" className="text-sm text-brand underline">
        ← Volver
      </Link>
      <h1 className="text-xl font-bold">Tarea</h1>
      <p className="text-sm text-slate-500">{task.prompt}</p>
      {result ? (
        <div className="rounded-2xl border border-brand/50 bg-brand/10 p-4">
          <p className="font-semibold">Puntuación: {Math.round(result.score * 100)}%</p>
          <p className="text-sm">{result.feedback}</p>
          <button
            type="button"
            className="mt-4 text-brand underline"
            onClick={() => router.push("/profile")}
          >
            Ir al perfil
          </button>
        </div>
      ) : null}
      {!result && task.type === "multiple_choice" ? (
        <MultipleChoiceTask
          question={String(task.payload.question ?? task.prompt)}
          options={(task.payload.options as string[]) ?? []}
          disabled={!!result}
          onSubmit={(i) => void submit({ index: i })}
        />
      ) : null}
      {!result && task.type === "writing" ? (
        <WritingTask
          topic={String(task.payload.topic ?? task.prompt)}
          minWords={Number(task.payload.minWords ?? 20)}
          maxWords={Number(task.payload.maxWords ?? 200)}
          disabled={!!result}
          onSubmit={(t) => void submit({ text: t })}
        />
      ) : null}
      {!result && task.type === "voice" ? (
        <VoiceTask
          promptToSay={String(task.payload.promptToSay ?? task.prompt)}
          speechLang="en-US"
          disabled={!!result}
          onSubmit={(t) => void submit({ transcript: t })}
        />
      ) : null}
      {!result && task.type === "drag_drop" ? (
        <DragDropTask
          items={(task.payload.items as string[]) ?? []}
          targets={(task.payload.targets as string[]) ?? []}
          mapping={(task.payload.mapping as Record<string, string>) ?? {}}
          disabled={!!result}
          onSubmit={(m) => void submit(m)}
        />
      ) : null}
      {!result && task.type === "match_pairs" ? (
        <MatchPairsTask
          instruction={String(
            (task.payload as { instruction?: string }).instruction ?? task.prompt,
          )}
          left={
            (task.payload as { left?: { id: string; text: string }[] }).left ??
            []
          }
          right={
            (task.payload as { right?: { id: string; text: string }[] }).right ??
            []
          }
          disabled={!!result}
          onSubmit={(a) => void submit(a)}
        />
      ) : null}
      {!result && task.type === "select_image" ? (
        <SelectImageTask
          instruction={String(
            (task.payload as { instruction?: string }).instruction ?? task.prompt,
          )}
          wordOrPhrase={String(
            (task.payload as { wordOrPhrase?: string }).wordOrPhrase ?? "",
          )}
          speakLang={String(
            (task.payload as { speakLang?: string }).speakLang ?? "en-US",
          )}
          options={
            (task.payload as { options?: { id: string; caption: string; emoji?: string; imageUrl?: string }[] })
              .options ?? []
          }
          disabled={!!result}
          onSubmit={(a) => void submit(a)}
        />
      ) : null}
      {!result && task.type === "pdf_worksheet" && worksheetUrl ? (
        <PdfWorksheetTask
          worksheetUrl={worksheetUrl}
          disabled={!!result}
          onUploaded={async (file) => {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("taskId", task.id);
            const url = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
            const res = await fetch(`${url}/files/evaluate`, {
              method: "POST",
              headers: { Authorization: `Bearer ${accessToken}` },
              body: fd,
            });
            if (res.ok) {
              const j = (await res.json()) as { score: number; feedback: unknown };
              setResult({
                score: j.score,
                feedback: JSON.stringify(j.feedback),
              });
            }
          }}
        />
      ) : null}
    </div>
  );
}
