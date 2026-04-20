import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../../common/supabase/supabase.service";
import { PdfGeneratorService } from "./pdf-generator.service";
import { PdfParserService } from "./pdf-parser.service";
import { StorageService } from "./storage.service";
import { GroqService } from "../ai/groq.service";

@Injectable()
export class FilesService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly pdfGen: PdfGeneratorService,
    private readonly pdfParse: PdfParserService,
    private readonly storage: StorageService,
    private readonly groq: GroqService,
  ) {}

  async generateWorksheet(userId: string, taskId?: string, lessonId?: string) {
    const sb = this.supabase.getClient();
    let title = "LingoFlow worksheet";
    let instructions = "Complete the exercises below.";
    const questions: { id: string; text: string }[] = [];

    if (taskId) {
      const { data: task } = await sb
        .from("tasks")
        .select("prompt, payload, type")
        .eq("id", taskId)
        .eq("user_id", userId)
        .single();
      if (!task) throw new NotFoundException("Task not found");
      title = (task.payload as { title?: string })?.title ?? task.prompt;
      instructions =
        (task.payload as { instructions?: string })?.instructions ??
        task.prompt;
      const qs = (task.payload as { questions?: { id: string; text: string }[] })
        ?.questions;
      if (qs?.length) questions.push(...qs);
      else questions.push({ id: "1", text: task.prompt });
    } else {
      questions.push(
        { id: "1", text: "Write 5 sentences using the present perfect." },
        { id: "2", text: "Translate: Me gustaría reservar una mesa." },
      );
      if (lessonId) {
        const { data: lesson } = await sb
          .from("lessons")
          .select("title, description")
          .eq("id", lessonId)
          .eq("user_id", userId)
          .single();
        if (lesson) {
          title = lesson.title;
          if (lesson.description) instructions = lesson.description;
        }
      }
    }

    const pdfBytes = await this.pdfGen.buildWorksheetPdf({
      title,
      instructions,
      questions,
    });
    const buffer = Buffer.from(pdfBytes);
    const { publicUrl, path } = await this.storage.uploadWorksheet(
      userId,
      "worksheet.pdf",
      buffer,
      "application/pdf",
    );

    if (taskId) {
      await sb.from("pdf_evaluations").insert({
        task_id: taskId,
        user_id: userId,
        source_pdf_url: publicUrl,
      });
    }

    return { url: publicUrl, path, title };
  }

  async evaluateSubmission(
    userId: string,
    buffer: Buffer,
    originalFilename: string,
    taskId?: string,
  ) {
    const extracted = await this.pdfParse.extractText(buffer);
    const { path } = await this.storage.uploadSubmission(
      userId,
      originalFilename,
      buffer,
      "application/pdf",
    );

    const sb = this.supabase.getClient();
    let sourceContext = "";
    if (taskId) {
      const { data: ev } = await sb
        .from("pdf_evaluations")
        .select("source_pdf_url, task_id")
        .eq("task_id", taskId)
        .eq("user_id", userId)
        .maybeSingle();
      if (ev?.source_pdf_url) sourceContext = ev.source_pdf_url;
    }

    const raw = await this.groq.completion(
      [
        {
          role: "system",
          content:
            'You evaluate completed language worksheets. Reply ONLY JSON: { "score": 0-1, "feedback": { "summary": string, "items": [{ "questionRef": string, "comment": string }] } }',
        },
        {
          role: "user",
          content: `Original worksheet URL (context): ${sourceContext}\nExtracted student text from PDF:\n${extracted.slice(0, 12000)}`,
        },
      ],
      { jsonMode: true, temperature: 0.2 },
    );

    let score = 0.7;
    let feedback: object = { summary: "Good work.", items: [] };
    try {
      const p = JSON.parse(raw) as {
        score?: number;
        feedback?: object;
      };
      score = Math.min(1, Math.max(0, Number(p.score ?? 0.7)));
      if (p.feedback) feedback = p.feedback;
    } catch {
      /* keep defaults */
    }

    const submissionUrl = await this.storage.getSignedSubmissionUrl(path);

    if (taskId) {
      await sb
        .from("pdf_evaluations")
        .update({
          submission_pdf_url: submissionUrl,
          extracted_text: extracted,
          ai_score: score,
          ai_feedback: feedback as object,
          graded_at: new Date().toISOString(),
        })
        .eq("task_id", taskId)
        .eq("user_id", userId);
    }

    return { score, feedback, extractedPreview: extracted.slice(0, 500) };
  }
}
