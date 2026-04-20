import { Injectable } from "@nestjs/common";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

@Injectable()
export class PdfGeneratorService {
  async buildWorksheetPdf(params: {
    title: string;
    instructions: string;
    questions: { id: string; text: string }[];
  }): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    let page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    let y = height - 50;
    const margin = 50;
    const lineHeight = 14;

    const draw = (text: string, size: number, useBold = false) => {
      if (y < margin + 40) {
        page = doc.addPage([595.28, 841.89]);
        y = height - 50;
      }
      page.drawText(text, {
        x: margin,
        y,
        size,
        font: useBold ? bold : font,
        color: rgb(0.1, 0.1, 0.1),
        maxWidth: width - margin * 2,
      });
      y -= size + 6;
    };

    draw(params.title, 18, true);
    y -= 6;
    draw(params.instructions, 11);
    y -= 10;
    params.questions.forEach((q, i) => {
      draw(`${i + 1}. ${q.text}`, 11);
      y -= 20;
    });

    return doc.save();
  }
}
