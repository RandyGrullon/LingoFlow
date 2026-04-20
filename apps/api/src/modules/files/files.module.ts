import { Module } from "@nestjs/common";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { PdfGeneratorService } from "./pdf-generator.service";
import { PdfParserService } from "./pdf-parser.service";
import { StorageService } from "./storage.service";

@Module({
  controllers: [FilesController],
  providers: [FilesService, PdfGeneratorService, PdfParserService, StorageService],
})
export class FilesModule {}
