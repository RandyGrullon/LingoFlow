import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../../common/supabase/supabase.service";
import { GroqService } from "../ai/groq.service";
import { PromptsService } from "../ai/prompts.service";
import { LearningService } from "./learning.service";
import { GradingService } from "./grading.service";
import type { TaskAssignment, TaskType, TutorMetaJson } from "@lingoflow/shared-types";

@Injectable()
export class TasksService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly groq: GroqService,
    private readonly prompts: PromptsService,
    private readonly learning: LearningService,
    private readonly grading: GradingService,
  ) {}

  async createFromAssignments(
    userId: string,
    lessonId: string | null,
    tasks: TaskAssignment[],
  ): Promise<string[]> {
    const sb = this.supabase.getClient();
    const ids: string[] = [];
    for (const t of tasks) {
      const row = {
        lesson_id: lessonId,
        user_id: userId,
        type: t.type,
        prompt: t.prompt,
        payload: t.payload as object,
        expected_answer: t.expected_answer as object,
        status: "pending",
      };
      const { data, error } = await sb.from("tasks").insert(row).select("id").single();
      if (error) throw error;
      if (data?.id) ids.push(data.id);
    }
    return ids;
  }

  async generateTasks(
    userId: string,
    topic: string | undefined,
    count: number,
  ): Promise<{ taskIds: string[] }> {
    const ctx = await this.learning.getTutorContext(userId);
    const prompt = this.prompts.taskGeneration({
      topic,
      count,
      ctx: {
        nativeLanguage: ctx.nativeLanguage,
        targetLanguage: ctx.targetLanguage,
        cefrLevel: ctx.cefrLevel,
        strengths: ctx.strengths,
        weaknesses: ctx.weaknesses,
        difficultyScore: ctx.difficultyScore,
      },
    });
    const raw = await this.groq.completion(
      [
        { role: "system", content: prompt },
        { role: "user", content: "Generate the tasks JSON now." },
      ],
      { jsonMode: true, temperature: 0.6 },
    );
    let parsed: { tasks?: TaskAssignment[] };
    try {
      parsed = JSON.parse(raw) as { tasks?: TaskAssignment[] };
    } catch {
      parsed = { tasks: [] };
    }
    const list = parsed.tasks ?? [];
    const taskIds = await this.createFromAssignments(userId, null, list.slice(0, count));
    return { taskIds };
  }

  async submitTask(
    userId: string,
    taskId: string,
    answer: unknown,
  ): Promise<{ score: number; feedback: string }> {
    const sb = this.supabase.getClient();
    const { data: task, error } = await sb
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", userId)
      .single();
    if (error || !task) throw new NotFoundException("Task not found");

    const type = task.type as TaskType;
    const ctx = await this.learning.getTutorContext(userId);
    const result = await this.grading.gradeSubmission({
      type,
      prompt: task.prompt as string,
      expected: task.expected_answer,
      userAnswer: answer,
      nativeLanguage: ctx.nativeLanguage,
      targetLanguage: ctx.targetLanguage,
    });

    await sb
      .from("tasks")
      .update({
        user_answer: answer as object,
        score: result.score,
        feedback: result.feedback,
        status: "graded",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    const meta: TutorMetaJson = {
      corrections: [],
      topics_practiced: result.score >= 0.7 ? ["exercise"] : [],
      topics_struggled: result.score < 0.6 ? ["exercise"] : [],
      tasksAssigned: [],
    };
    await this.learning.updateFromMeta(userId, meta, result.score);

    return { score: result.score, feedback: result.feedback };
  }

  async listPending(userId: string) {
    const sb = this.supabase.getClient();
    const { data, error } = await sb
      .from("tasks")
      .select("id, type, prompt, payload, status, created_at")
      .eq("user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  }

  async getTask(userId: string, taskId: string) {
    const sb = this.supabase.getClient();
    const { data, error } = await sb
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", userId)
      .single();
    if (error || !data) throw new NotFoundException("Task not found");
    // No exponer respuestas correctas al cliente
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { expected_answer: _expected, ...safe } = data as Record<
      string,
      unknown
    >;
    return safe;
  }
}
