import { Global, Module } from "@nestjs/common";
import { GroqService } from "./groq.service";
import { PromptsService } from "./prompts.service";

@Global()
@Module({
  providers: [GroqService, PromptsService],
  exports: [GroqService, PromptsService],
})
export class AiModule {}
