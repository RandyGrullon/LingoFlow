import { Injectable } from "@nestjs/common";

// pdf-parse is CommonJS
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;

@Injectable()
export class PdfParserService {
  async extractText(buffer: Buffer): Promise<string> {
    const res = await pdfParse(buffer);
    const text = (res.text ?? "").trim();
    if (text.length > 50) return text;
    return text;
  }
}
