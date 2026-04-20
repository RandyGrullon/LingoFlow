import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Groq from "groq-sdk";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export type ChatMessage = Groq.Chat.ChatCompletionMessageParam;

@Injectable()
export class GroqService {
  private readonly client: Groq;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>("GROQ_API_KEY");
    if (!apiKey) {
      console.warn("GROQ_API_KEY not set; Groq calls will fail");
    }
    this.client = new Groq({ apiKey: apiKey ?? "dummy" });
  }

  private getModel(): string {
    return this.config.get<string>("GROQ_MODEL") ?? "llama-3.3-70b-versatile";
  }

  async *streamChat(
    messages: ChatMessage[],
    opts?: { jsonMode?: boolean },
  ): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: this.getModel(),
      messages,
      stream: true,
      temperature: 0.7,
      response_format: opts?.jsonMode
        ? { type: "json_object" }
        : undefined,
    });
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  }

  async completion(
    messages: ChatMessage[],
    opts?: { jsonMode?: boolean; temperature?: number },
  ): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: this.getModel(),
      messages,
      temperature: opts?.temperature ?? 0.5,
      response_format: opts?.jsonMode
        ? { type: "json_object" }
        : undefined,
    });
    return res.choices[0]?.message?.content ?? "";
  }

  /**
   * Whisper transcription (fallback when Web Speech API is unavailable).
   */
  async transcribe(audioFilePath: string, language?: string): Promise<string> {
    const fileStream = fs.createReadStream(audioFilePath);
    const transcription = await this.client.audio.transcriptions.create({
      // groq-sdk accepts ReadStream in Node
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      file: fileStream as any,
      model: "whisper-large-v3-turbo",
      language: language ?? undefined,
    });
    return typeof transcription === "string"
      ? transcription
      : (transcription as { text?: string }).text ?? "";
  }

  async transcribeBuffer(
    buffer: Buffer,
    filename: string,
    language?: string,
  ): Promise<string> {
    const tmp = path.join(
      os.tmpdir(),
      "lf-upload-" + Date.now() + path.extname(filename),
    );
    try {
      await fs.promises.writeFile(tmp, buffer);
      return await this.transcribe(tmp, language);
    } finally {
      await fs.promises.unlink(tmp).catch(() => undefined);
    }
  }
}
