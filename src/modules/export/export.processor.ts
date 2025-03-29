import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ExportService } from './export.service';
import { PdfData } from './interfaces/pdf-data.interface';

@Processor('pdf-queue')
export class ExportProcessor {
  constructor(private readonly exportService: ExportService) {}

  @Process('export-pdf')
  async handleExport(job: Job<{ data: PdfData; filePath: string }>) {
    const { data, filePath } = job.data;
    await this.exportService.generatePdf(data, filePath);
  }
}