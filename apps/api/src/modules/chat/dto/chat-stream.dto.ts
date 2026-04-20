import { IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class ChatStreamDto {
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsString()
  @MinLength(1)
  message!: string;
}
