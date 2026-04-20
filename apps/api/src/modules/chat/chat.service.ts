import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../common/supabase/supabase.service";
import { GroqService, ChatMessage } from "../ai/groq.service";
import { PromptsService } from "../ai/prompts.service";
import { LearningService } from "../learning/learning.service";
import { TasksService } from "../learning/tasks.service";
import { META_DELIMITER } from "@lingoflow/prompts";
import type { TutorMetaJson } from "@lingoflow/shared-types";

export interface StreamChunk {
  type: "token" | "done" | "error" | "tasks_created";
  data?: string;
  meta?: TutorMetaJson;
  taskIds?: string[];
  message?: string;
}

@Injectable()
export class ChatService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly groq: GroqService,
    private readonly prompts: PromptsService,
    private readonly learning: LearningService,
    private readonly tasks: TasksService,
  ) {}

  async ensureProfile(userId: string): Promise<void> {
    const sb = this.supabase.getClient();
    const { data } = await sb
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (data) return;
    await sb.from("profiles").insert({
      id: userId,
      native_language: "es",
      target_language: "en",
      cefr_level: "A1",
    });
    await sb.from("learning_profiles").insert({
      user_id: userId,
      strengths: [],
      weaknesses: [],
      goals: [],
      difficulty_score: 1,
      recent_task_scores: [],
      weak_streak: {},
      total_xp: 0,
      streak_days: 0,
    });
  }

  async *streamChat(
    userId: string,
    conversationId: string | undefined,
    userMessage: string,
  ): AsyncGenerator<StreamChunk> {
    await this.ensureProfile(userId);
    const sb = this.supabase.getClient();
    const ctx = await this.learning.getTutorContext(userId);
    const system = this.prompts.tutorSystem({
      nativeLanguage: ctx.nativeLanguage,
      targetLanguage: ctx.targetLanguage,
      cefrLevel: ctx.cefrLevel,
      strengths: ctx.strengths,
      weaknesses: ctx.weaknesses,
      difficultyScore: ctx.difficultyScore,
    });

    let convId = conversationId;
    if (!convId) {
      const { data: conv, error } = await sb
        .from("conversations")
        .insert({
          user_id: userId,
          title: userMessage.slice(0, 80),
        })
        .select("id")
        .single();
      if (error) throw error;
      convId = conv!.id as string;
    }

    await sb.from("messages").insert({
      conversation_id: convId,
      role: "user",
      content: userMessage,
    });

    const { data: history } = await sb
      .from("messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(40);

    const messages: ChatMessage[] = [
      { role: "system", content: system },
      ...((history ?? []) as { role: string; content: string }[]).map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    ];

    let fullBuffer = "";
    let sentVisible = 0;

    for await (const chunk of this.groq.streamChat(messages)) {
      fullBuffer += chunk;
      const metaIdx = fullBuffer.indexOf(META_DELIMITER);
      const visibleEnd =
        metaIdx === -1 ? fullBuffer.length : metaIdx;
      if (visibleEnd > sentVisible) {
        const delta = fullBuffer.slice(sentVisible, visibleEnd);
        sentVisible = visibleEnd;
        if (delta) yield { type: "token", data: delta };
      }
    }

    const parts = fullBuffer.split(META_DELIMITER);
    const visible = parts[0]?.trim() ?? "";
    let meta: TutorMetaJson = {
      corrections: [],
      topics_practiced: [],
      topics_struggled: [],
      tasksAssigned: [],
    };
    if (parts.length > 1) {
      try {
        const raw = parts.slice(1).join(META_DELIMITER).trim();
        meta = { ...meta, ...JSON.parse(raw) };
      } catch {
        yield {
          type: "error",
          message: "Could not parse tutor metadata JSON.",
        };
      }
    }

    const { error: insErr } = await sb.from("messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: visible,
      corrections: meta.corrections as object,
    });
    if (insErr) throw insErr;

    await sb
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", convId);

    await this.learning.updateFromMeta(userId, meta);

    let taskIds: string[] = [];
    if (meta.tasksAssigned?.length) {
      taskIds = await this.tasks.createFromAssignments(
        userId,
        null,
        meta.tasksAssigned,
      );
    }

    yield {
      type: "done",
      meta,
      taskIds,
      data: JSON.stringify({ conversationId: convId }),
    };
    if (taskIds.length) {
      yield { type: "tasks_created", taskIds };
    }
  }

  async listConversations(userId: string) {
    const sb = this.supabase.getClient();
    const { data, error } = await sb
      .from("conversations")
      .select("id, title, last_message_at, created_at")
      .eq("user_id", userId)
      .order("last_message_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  }

  async listMessages(userId: string, conversationId: string) {
    const sb = this.supabase.getClient();
    const { data: conv } = await sb
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .single();
    if (!conv) return [];
    const { data, error } = await sb
      .from("messages")
      .select("id, role, content, corrections, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }
}
