import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { JwtPayload } from "../../common/guards/supabase-auth.guard";
import { TasksService } from "./tasks.service";
import { GenerateTasksDto } from "./dto/generate-tasks.dto";
import { Allow } from "class-validator";

class SubmitTaskDto {
  @Allow()
  answer!: unknown;
}

@Controller("tasks")
@UseGuards(SupabaseAuthGuard)
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get("pending")
  pending(@CurrentUser() user: JwtPayload) {
    return this.tasks.listPending(user.sub);
  }

  @Get(":id")
  one(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.tasks.getTask(user.sub, id);
  }

  @Post("generate")
  generate(
    @CurrentUser() user: JwtPayload,
    @Body() body: GenerateTasksDto,
  ) {
    return this.tasks.generateTasks(
      user.sub,
      body.topic,
      body.count ?? 3,
    );
  }

  @Post(":id/submit")
  submit(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() body: SubmitTaskDto,
  ) {
    return this.tasks.submitTask(user.sub, id, body.answer);
  }
}
