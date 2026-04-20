import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { JwtPayload } from "../../common/guards/supabase-auth.guard";
import { ChatService } from "./chat.service";
import { ChatStreamDto } from "./dto/chat-stream.dto";

@Controller("chat")
@UseGuards(SupabaseAuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get("conversations")
  async conversations(@CurrentUser() user: JwtPayload) {
    return this.chat.listConversations(user.sub);
  }

  @Get("conversations/:id/messages")
  async messages(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
  ) {
    return this.chat.listMessages(user.sub, id);
  }

  @Post("stream")
  async stream(
    @CurrentUser() user: JwtPayload,
    @Body() body: ChatStreamDto,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const send = (obj: unknown) => {
      res.write(`data: ${JSON.stringify(obj)}\n\n`);
    };

    try {
      for await (const chunk of this.chat.streamChat(
        user.sub,
        body.conversationId,
        body.message,
      )) {
        send(chunk);
        if (chunk.type === "done" && chunk.data) {
          try {
            const parsed = JSON.parse(chunk.data) as { conversationId?: string };
            if (parsed.conversationId) {
              send({ type: "conversation", conversationId: parsed.conversationId });
            }
          } catch {
            /* ignore */
          }
        }
      }
    } catch (e) {
      send({
        type: "error",
        message: e instanceof Error ? e.message : "Stream failed",
      });
    } finally {
      res.end();
    }
  }
}
