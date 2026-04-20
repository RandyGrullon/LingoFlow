import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../../common/supabase/supabase.service";

@Injectable()
export class StorageService {
  constructor(private readonly supabase: SupabaseService) {}

  async uploadWorksheet(
    userId: string,
    filename: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<{ path: string; publicUrl: string }> {
    const path = `${userId}/${Date.now()}-${filename}`;
    const sb = this.supabase.getClient();
    const { error } = await sb.storage.from("worksheets").upload(path, buffer, {
      contentType,
      upsert: true,
    });
    if (error) throw error;
    const { data } = sb.storage.from("worksheets").getPublicUrl(path);
    return { path, publicUrl: data.publicUrl };
  }

  async uploadSubmission(
    userId: string,
    filename: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<{ path: string }> {
    const path = `${userId}/${Date.now()}-${filename}`;
    const sb = this.supabase.getClient();
    const { error } = await sb.storage.from("submissions").upload(path, buffer, {
      contentType,
      upsert: false,
    });
    if (error) throw error;
    return { path };
  }

  getSignedSubmissionUrl(path: string, expiresIn = 3600): Promise<string> {
    return this.supabase
      .getClient()
      .storage.from("submissions")
      .createSignedUrl(path, expiresIn)
      .then(({ data, error }) => {
        if (error) throw error;
        return data.signedUrl;
      });
  }
}
