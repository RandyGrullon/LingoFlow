import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../common/supabase/supabase.service";
import type { TutorMetaJson } from "@lingoflow/shared-types";

const DIFF_MIN = 0.5;
const DIFF_MAX = 2.0;
const WEAK_THRESHOLD = 3;

@Injectable()
export class LearningService {
  constructor(private readonly supabase: SupabaseService) {}

  async getTutorContext(userId: string): Promise<{
    nativeLanguage: string;
    targetLanguage: string;
    cefrLevel: string;
    strengths: string[];
    weaknesses: string[];
    difficultyScore: number;
  }> {
    const sb = this.supabase.getClient();
    const { data: profile, error: pErr } = await sb
      .from("profiles")
      .select("native_language, target_language, cefr_level")
      .eq("id", userId)
      .single();
    if (pErr || !profile) {
      return {
        nativeLanguage: "es",
        targetLanguage: "en",
        cefrLevel: "A1",
        strengths: [],
        weaknesses: [],
        difficultyScore: 1,
      };
    }
    const { data: lp } = await sb
      .from("learning_profiles")
      .select(
        "strengths, weaknesses, difficulty_score, recent_task_scores, weak_streak",
      )
      .eq("user_id", userId)
      .single();

    const strengths = (lp?.strengths as string[] | null) ?? [];
    const weaknesses = (lp?.weaknesses as string[] | null) ?? [];
    const difficultyScore = Number(lp?.difficulty_score ?? 1);
    return {
      nativeLanguage: profile.native_language,
      targetLanguage: profile.target_language,
      cefrLevel: profile.cefr_level ?? "A1",
      strengths,
      weaknesses,
      difficultyScore,
    };
  }

  async updateFromMeta(
    userId: string,
    meta: TutorMetaJson,
    lastTaskScore?: number,
  ): Promise<void> {
    const sb = this.supabase.getClient();
    const { data: lp } = await sb
      .from("learning_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    let strengths = new Set<string>(
      (lp?.strengths as string[] | undefined) ?? [],
    );
    let weaknesses = new Set<string>(
      (lp?.weaknesses as string[] | undefined) ?? [],
    );
    let weakStreak = (lp?.weak_streak as Record<string, number> | null) ?? {};
    let difficulty = Number(lp?.difficulty_score ?? 1);
    const recent: number[] = Array.isArray(lp?.recent_task_scores)
      ? [...(lp.recent_task_scores as number[])]
      : [];

    for (const t of meta.topics_practiced ?? []) {
      strengths.add(t);
    }
    for (const t of meta.topics_struggled ?? []) {
      weaknesses.add(t);
      strengths.delete(t);
      weakStreak[t] = (weakStreak[t] ?? 0) + 1;
    }

    if (lastTaskScore !== undefined) {
      recent.push(lastTaskScore);
      while (recent.length > 20) recent.shift();
      const avg =
        recent.reduce((a, b) => a + b, 0) / Math.max(recent.length, 1);
      difficulty = Math.min(
        DIFF_MAX,
        Math.max(
          DIFF_MIN,
          difficulty + (avg - 0.7) * 0.15,
        ),
      );
    }

    let cefr: string | undefined;
    const { data: prof } = await sb
      .from("profiles")
      .select("cefr_level")
      .eq("id", userId)
      .single();
    const currentCefr = prof?.cefr_level ?? "A1";
    if (recent.length >= 10) {
      const avg =
        recent.reduce((a, b) => a + b, 0) / recent.length;
      if (avg >= 0.85) cefr = bumpCefr(currentCefr, 1);
      else if (avg <= 0.45) cefr = bumpCefr(currentCefr, -1);
    }

    const totalXp = (lp?.total_xp as number | undefined) ?? 0;
    const newXp = totalXp + Math.round(5 * (meta.topics_practiced?.length ?? 0));

    await sb.from("learning_profiles").upsert(
      {
        user_id: userId,
        strengths: [...strengths],
        weaknesses: [...weaknesses],
        goals: [],
        difficulty_score: difficulty,
        recent_task_scores: recent,
        weak_streak: weakStreak,
        total_xp: newXp,
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (cefr) {
      await sb.from("profiles").update({ cefr_level: cefr }).eq("id", userId);
    }
  }

  async getFullProfile(userId: string) {
    const sb = this.supabase.getClient();
    const { data: profile, error: pErr } = await sb
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (pErr || !profile) {
      return { profile: null, learning: null };
    }
    const { data: learning } = await sb
      .from("learning_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    return { profile, learning };
  }

  async updateProfile(
    userId: string,
    body: {
      displayName?: string;
      nativeLanguage?: string;
      targetLanguage?: string;
      cefrLevel?: string;
    },
  ) {
    const sb = this.supabase.getClient();
    const patch: Record<string, string> = {};
    if (body.displayName !== undefined) patch.display_name = body.displayName;
    if (body.nativeLanguage !== undefined)
      patch.native_language = body.nativeLanguage;
    if (body.targetLanguage !== undefined)
      patch.target_language = body.targetLanguage;
    if (body.cefrLevel !== undefined) patch.cefr_level = body.cefrLevel;
    if (Object.keys(patch).length) {
      await sb.from("profiles").update(patch).eq("id", userId);
    }
    return this.getFullProfile(userId);
  }

  async shouldForcePdfWorksheet(userId: string): Promise<boolean> {
    const { data } = await this.supabase
      .getClient()
      .from("learning_profiles")
      .select("weak_streak")
      .eq("user_id", userId)
      .single();
    const ws = (data?.weak_streak as Record<string, number> | null) ?? {};
    return Object.values(ws).some((n) => n >= WEAK_THRESHOLD);
  }
}

function bumpCefr(current: string, delta: number): string {
  const order = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const i = Math.max(0, order.indexOf(current));
  const ni = Math.min(order.length - 1, Math.max(0, i + delta));
  return order[ni] ?? current;
}
