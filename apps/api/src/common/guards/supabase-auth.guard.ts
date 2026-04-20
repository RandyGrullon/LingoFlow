import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import * as jwt from "jsonwebtoken";

export interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }
    const token = auth.slice(7);
    const secret = this.config.get<string>("SUPABASE_JWT_SECRET");
    if (!secret) {
      throw new UnauthorizedException("Server misconfigured");
    }
    try {
      const payload = jwt.verify(token, secret) as JwtPayload;
      if (!payload.sub) {
        throw new UnauthorizedException("Invalid token");
      }
      (req as Request & { user: JwtPayload }).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
