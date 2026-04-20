import { Injectable } from "@nestjs/common";
import { GroqService } from "../ai/groq.service";
import type { TaskType } from "@lingoflow/shared-types";

export interface GradeResult {
  score: number;
  feedback: string;
}

export interface GradeSubmissionInput {
  type: TaskType;
  prompt: string;
  expected: unknown;
  userAnswer: unknown;
  nativeLanguage: string;
  targetLanguage: string;
}

@Injectable()
export class GradingService {
  constructor(private readonly groq: GroqService) {}

  computeScore(
    type: TaskType,
    expected: unknown,
    userAnswer: unknown,
  ): GradeResult | null {
    if (type === "multiple_choice") {
      const exp = expected as { index?: number };
      const ua = userAnswer as { index?: number };
      if (
        typeof exp?.index === "number" &&
        typeof ua?.index === "number"
      ) {
        const ok = exp.index === ua.index;
        return {
          score: ok ? 1 : 0,
          feedback: ok ? "correct" : "incorrect",
        };
      }
    }
    if (type === "select_image") {
      const exp = expected as { optionId?: string };
      const ua = userAnswer as { optionId?: string };
      if (typeof exp?.optionId === "string" && typeof ua?.optionId === "string") {
        const ok = exp.optionId === ua.optionId;
        return {
          score: ok ? 1 : 0,
          feedback: ok ? "correct" : "incorrect",
        };
      }
    }
    if (type === "drag_drop") {
      const exp = expected as Record<string, string>;
      const ua = userAnswer as Record<string, string>;
      if (!exp || !ua) return null;
      const keys = Object.keys(exp);
      let correct = 0;
      for (const k of keys) {
        if (exp[k] === ua[k]) correct++;
      }
      const score = keys.length ? correct / keys.length : 0;
      return {
        score,
        feedback: score >= 1 ? "perfect" : "partial",
      };
    }
    if (type === "match_pairs") {
      const exp = expected as { matches?: Record<string, string> };
      const ua = userAnswer as { matches?: Record<string, string> };
      const expectedMap = exp?.matches;
      const userMap = ua?.matches;
      if (!expectedMap || !userMap) return null;
      const keys = Object.keys(expectedMap);
      let correct = 0;
      for (const k of keys) {
        if (expectedMap[k] === userMap[k]) correct++;
      }
      const score = keys.length ? correct / keys.length : 0;
      return {
        score,
        feedback: score >= 1 ? "perfect" : "partial",
      };
    }
    return null;
  }

  async aiVerbalFeedback(input: {
    score: number;
    taskType: TaskType;
    prompt: string;
    userAnswer: unknown;
    nativeLanguage: string;
    targetLanguage: string;
  }): Promise<string> {
    const { score, taskType, prompt, userAnswer, nativeLanguage, targetLanguage } =
      input;
    const content = await this.groq.completion(
      [
        {
          role: "system",
          content: `You are a supportive language tutor. Reply ONLY valid JSON: { "feedback": string }.
The "feedback" must be ONE short sentence (max 25 words) in ${nativeLanguage}, reacting to the student's result with warmth.
Mention if they were correct or what to improve. Score is ${score} (0–1).`,
        },
        {
          role: "user",
          content: `Task type: ${taskType}
Exercise prompt: ${prompt}
Student submission: ${JSON.stringify(userAnswer)}`,
        },
      ],
      { jsonMode: true, temperature: 0.45 },
    );
    try {
      const parsed = JSON.parse(content) as { feedback?: string };
      if (parsed.feedback?.trim()) return parsed.feedback.trim();
    } catch {
      /* fall through */
    }
    return score >= 0.99
      ? "¡Excelente!"
      : score >= 0.5
        ? "¡Buen intento! Sigue practicando."
        : "Repasa el tema y prueba de nuevo.";
  }

  async gradeSubmission(input: GradeSubmissionInput): Promise<GradeResult> {
    const { type, prompt, expected, userAnswer, nativeLanguage, targetLanguage } =
      input;
    const sync = this.computeScore(type, expected, userAnswer);
    if (sync) {
      const feedback = await this.aiVerbalFeedback({
        score: sync.score,
        taskType: type,
        prompt,
        userAnswer,
        nativeLanguage,
        targetLanguage,
      });
      return { score: sync.score, feedback };
    }

    const content = await this.groq.completion(
      [
        {
          role: "system",
          content:
            'You grade language exercises. Reply ONLY valid JSON: { "score": number between 0 and 1, "feedback": string (short, encouraging) }.',
        },
        {
          role: "user",
          content: `Task type: ${type}\nPrompt: ${prompt}\nExpected (reference): ${JSON.stringify(expected)}\nStudent answer: ${JSON.stringify(userAnswer)}`,
        },
      ],
      { jsonMode: true, temperature: 0.2 },
    );
    try {
      const parsed = JSON.parse(content) as { score?: number; feedback?: string };
      const score = Math.min(1, Math.max(0, Number(parsed.score ?? 0.5)));
      const fb = await this.aiVerbalFeedback({
        score,
        taskType: type,
        prompt,
        userAnswer,
        nativeLanguage,
        targetLanguage,
      });
      return { score, feedback: fb };
    } catch {
      const fb = await this.aiVerbalFeedback({
        score: 0.5,
        taskType: type,
        prompt,
        userAnswer,
        nativeLanguage,
        targetLanguage,
      });
      return { score: 0.5, feedback: fb };
    }
  }

  /** @deprecated use gradeSubmission */
  async gradeWithAi(params: {
    type: TaskType;
    prompt: string;
    expected: unknown;
    userAnswer: unknown;
    nativeLanguage?: string;
    targetLanguage?: string;
  }): Promise<GradeResult> {
    return this.gradeSubmission({
      type: params.type,
      prompt: params.prompt,
      expected: params.expected,
      userAnswer: params.userAnswer,
      nativeLanguage: params.nativeLanguage ?? "es",
      targetLanguage: params.targetLanguage ?? "en",
    });
  }
}
