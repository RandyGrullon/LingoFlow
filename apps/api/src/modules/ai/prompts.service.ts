import { Injectable } from "@nestjs/common";
import {
  buildTutorSystemPrompt,
  buildTaskGenerationPrompt,
  TutorContext,
} from "@lingoflow/prompts";

@Injectable()
export class PromptsService {
  tutorSystem(ctx: TutorContext): string {
    return buildTutorSystemPrompt(ctx);
  }

  taskGeneration(params: {
    topic?: string;
    count: number;
    ctx: TutorContext;
  }): string {
    return buildTaskGenerationPrompt(params);
  }
}
