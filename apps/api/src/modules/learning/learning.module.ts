import { Module } from "@nestjs/common";
import { LearningService } from "./learning.service";
import { TasksService } from "./tasks.service";
import { GradingService } from "./grading.service";
import { TasksController } from "./tasks.controller";
import { ProfileController } from "./profile.controller";

@Module({
  controllers: [TasksController, ProfileController],
  providers: [LearningService, TasksService, GradingService],
  exports: [LearningService, TasksService, GradingService],
})
export class LearningModule {}
