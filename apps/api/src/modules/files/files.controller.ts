import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { JwtPayload } from "../../common/guards/supabase-auth.guard";
import { FilesService } from "./files.service";
import { GroqService } from "../ai/groq.service";
import { IsOptional, IsString } from "class-validator";

class GenerateWorksheetDto {
  @IsOptional()
  @IsString()
  lessonId?: string;

  @IsOptional()
  @IsString()
  taskId?: string;
}

@Controller("files")
@UseGuards(SupabaseAuthGuard)
export class FilesController {
  constructor(
    private readonly files: FilesService,
    private readonly groq: GroqService,
  ) {}

  @Post("worksheet/generate")
  generate(
    @CurrentUser() user: JwtPayload,
    @Body() body: GenerateWorksheetDto,
  ) {
    return this.files.generateWorksheet(user.sub, body.taskId, body.lessonId);
  }

  @Post("evaluate")
  @UseInterceptors(FileInterceptor("file"))
  evaluate(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body("taskId") taskId?: string,
  ) {
    if (!file?.buffer) {
      return { error: "No file uploaded" };
    }
    return this.files.evaluateSubmission(
      user.sub,
      file.buffer,
      file.originalname,
      taskId,
    );
  }

  @Post("transcribe")
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  async transcribe(
    @UploadedFile() file: Express.Multer.File,
    @Body("language") language?: string,
  ) {
    if (!file?.buffer) {
      return { text: "" };
    }
    const text = await this.groq.transcribeBuffer(
      file.buffer,
      file.originalname,
      language,
    );
    return { text };
  }
}
