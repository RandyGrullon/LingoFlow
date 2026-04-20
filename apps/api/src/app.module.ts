import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { resolve } from "node:path";
import { AppController } from "./app.controller";
import { AiModule } from "./modules/ai/ai.module";
import { SupabaseModule } from "./common/supabase/supabase.module";
import { ChatModule } from "./modules/chat/chat.module";
import { LearningModule } from "./modules/learning/learning.module";
import { FilesModule } from "./modules/files/files.module";

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve(__dirname, "../../../.env"),
    }),
    SupabaseModule,
    AiModule,
    ChatModule,
    LearningModule,
    FilesModule,
  ],
})
export class AppModule {}
