"use client";

import { useCallback, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { TutorMetaJson } from "@lingoflow/shared-types";

export interface StreamCallbacks {
  onToken?: (t: string) => void;
  onDone?: (meta: TutorMetaJson | undefined, conversationId?: string) => void;
  onTasksCreated?: (ids: string[]) => void;
  onError?: (msg: string) => void;
}

export function useChatStream(token: string | null) {
  const [streaming, setStreaming] = useState(false);

  const sendMessage = useCallback(
    async (
      message: string,
      conversationId: string | undefined,
      callbacks: StreamCallbacks,
    ) => {
      if (!token) {
        callbacks.onError?.("Not signed in");
        return;
      }
      setStreaming(true);
      try {
        const res = await apiFetch("/chat/stream", token, {
          method: "POST",
          body: JSON.stringify({ message, conversationId }),
        });
        if (!res.ok || !res.body) {
          callbacks.onError?.(`HTTP ${res.status}`);
          setStreaming(false);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let rawBuffer = "";
        let convId: string | undefined;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          rawBuffer += decoder.decode(value, { stream: true });
          let lineEnd: number;
          while ((lineEnd = rawBuffer.indexOf("\n")) >= 0) {
            const line = rawBuffer.slice(0, lineEnd).replace(/\r$/, "").trim();
            rawBuffer = rawBuffer.slice(lineEnd + 1);
            if (!line.startsWith("data:")) continue;
            const raw = line.startsWith("data: ")
              ? line.slice(6).trim()
              : line.slice(5).trim();
            if (!raw) continue;
            try {
              const evt = JSON.parse(raw) as {
                type?: string;
                data?: string;
                meta?: TutorMetaJson;
                taskIds?: string[];
                message?: string;
              };
              if (evt.type === "token" && evt.data) {
                callbacks.onToken?.(evt.data);
              }
              if (evt.type === "conversation") {
                const c = (evt as { conversationId?: string }).conversationId;
                if (c) convId = c;
              }
              if (evt.type === "done") {
                let cid = convId;
                if (evt.data) {
                  try {
                    const p = JSON.parse(evt.data) as { conversationId?: string };
                    if (p.conversationId) cid = p.conversationId;
                  } catch {
                    /* ignore */
                  }
                }
                callbacks.onDone?.(evt.meta, cid);
              }
              if (evt.type === "tasks_created" && evt.taskIds?.length) {
                callbacks.onTasksCreated?.(evt.taskIds);
              }
              if (evt.type === "error") {
                callbacks.onError?.(evt.message ?? "Stream error");
              }
            } catch {
              /* ignore parse errors for partial chunks */
            }
          }
        }
      } catch (e) {
        callbacks.onError?.(e instanceof Error ? e.message : "Network error");
      } finally {
        setStreaming(false);
      }
    },
    [token],
  );

  return { streaming, sendMessage };
}
