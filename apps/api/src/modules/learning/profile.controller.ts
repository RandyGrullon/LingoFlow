import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { JwtPayload } from "../../common/guards/supabase-auth.guard";
import { LearningService } from "./learning.service";
import { IsOptional, IsString } from "class-validator";

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  nativeLanguage?: string;

  @IsOptional()
  @IsString()
  targetLanguage?: string;

  @IsOptional()
  @IsString()
  cefrLevel?: string;
}

@Controller("profile")
@UseGuards(SupabaseAuthGuard)
export class ProfileController {
  constructor(private readonly learning: LearningService) {}

  @Get()
  me(@CurrentUser() user: JwtPayload) {
    return this.learning.getFullProfile(user.sub);
  }

  @Patch()
  update(@CurrentUser() user: JwtPayload, @Body() body: UpdateProfileDto) {
    return this.learning.updateProfile(user.sub, body);
  }
}
