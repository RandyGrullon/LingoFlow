"use client";

import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { VoiceInputButton } from "./VoiceInputButton";
import { useChatStream } from "@/hooks/useChatStream";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import type { CorrectionItem } from "@lingoflow/shared-types";
import { apiFetch } from "@/lib/api";

export interface ChatMessageRow {
  id: string;
  role: "user" | "assistant";
  content: string;
  corrections?: CorrectionItem[] | null;
}

export function ChatWindow(props: {
  token: string;
  conversationId: string | null;
  onConversationId: (id: string) => void;
  speechLang: string;
  targetLangForTts: string;
}) {
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [input, setInput] = useState("");
  const [partialAssistant, setPartialAssistant] = useState("");
  const assistantAcc = useRef("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { streaming, sendMessage } = useChatStream(props.token);
  const { speak } = useSpeechSynthesis(props.targetLangForTts);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partialAssistant]);

  useEffect(() => {
    if (!props.conversationId) {
      setMessages([]);
      return;
    }
    void (async () => {
      const res = await apiFetch(
        `/chat/conversations/${props.conversationId}/messages`,
        props.token,
      );
      if (!res.ok) return;
      const rows = (await res.json()) as {
        id: string;
        role: string;
        content: string;
        corrections: CorrectionItem[] | null;
      }[];
      setMessages(
        rows.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          corrections: m.corrections,
        })),
      );
    })();
  }, [props.conversationId, props.token]);

  async function handleSend() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    const userMsg: ChatMessageRow = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((m) => [...m, userMsg]);
    assistantAcc.current = "";
    setPartialAssistant("");

    await sendMessage(text, props.conversationId ?? undefined, {
      onToken: (t) => {
        assistantAcc.current += t;
        setPartialAssistant(assistantAcc.current);
      },
      onDone: (meta, convId) => {
        const content = assistantAcc.current.trim();
        assistantAcc.current = "";
        setPartialAssistant("");
        if (convId) props.onConversationId(convId);
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content,
            corrections: meta?.corrections ?? null,
          },
        ]);
      },
      onTasksCreated: () => {
        /* optional: toast or redirect */
      },
      onError: (msg) => {
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Error: ${msg}`,
          },
        ]);
      },
    });
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-2xl border border-slate-700 bg-slate-900/40 dark:border-slate-200 dark:bg-white/60">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            role={m.role}
            content={m.content}
            corrections={m.corrections}
          />
        ))}
        {partialAssistant ? (
          <MessageBubble role="assistant" content={partialAssistant} />
        ) : null}
        {streaming && !partialAssistant ? <TypingIndicator /> : null}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-slate-700 p-3 dark:border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <VoiceInputButton
            lang={props.speechLang}
            disabled={streaming}
            onFinal={(t) => setInput((prev) => (prev ? `${prev} ${t}` : t))}
          />
          <input
            className="min-w-[200px] flex-1 rounded-xl border border-slate-600 bg-transparent px-3 py-2 text-sm dark:border-slate-300"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe o dicta..."
            onKeyDown={(e) => e.key === "Enter" && void handleSend()}
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={streaming}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Enviar
          </button>
          <button
            type="button"
            className="text-xs text-slate-500 underline"
            onClick={() => {
              const last = [...messages].reverse().find((m) => m.role === "assistant");
              if (last) speak(last.content);
            }}
          >
            Leer última
          </button>
        </div>
      </div>
    </div>
  );
}
