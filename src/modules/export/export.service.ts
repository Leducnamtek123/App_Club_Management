// src/modules/export/export.service.ts
import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PdfData } from './interfaces/pdf-data.interface';
import path from 'path';

@Injectable()
export class ExportService {
  constructor(@InjectQueue('pdf-queue') private readonly pdfQueue: Queue) {
    this.checkQueueConnection();
  }

  async checkQueueConnection() {
    try {
      await this.pdfQueue.client.ping();
      console.log('Redis connection successful');
    } catch (error) {
      console.error('Redis connection failed:', error);
    }
  }

  async queueExportToPdf(
    data: PdfData,
  ): Promise<{ jobId: string; downloadUrl: string }> {
    console.log('Queueing job with pdfData rows:', data.rows.length);
    const jobId = uuidv4();
    const fileName = `export-${jobId}.pdf`;
    const filePath = `./uploads/${fileName}`;
    const downloadUrl = `/downloads/${fileName}`;

    const job = await this.pdfQueue.add('export-pdf', { data, filePath });
    console.log('Job queued with ID:', job.id);
    return { jobId, downloadUrl };
  }

  async generatePdf(data: PdfData, filePath: string): Promise<void> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    const fontPath = path.resolve(
      __dirname,
      '../../assets/fonts/Times New Roman.ttf',
    );
    console.log('Font path:', fontPath);
    console.log('Font exists:', fs.existsSync(fontPath));

    if (!fs.existsSync(fontPath)) {
      throw new Error(`Font file not found at ${fontPath}`);
    }

    try {
      doc.registerFont('TimesNewRomanFont', fontPath);
      doc.font('TimesNewRomanFont');
    } catch (error) {
      console.error('Error registering font:', error);
      throw error;
    }

    doc.fontSize(16).text(data.title, { align: 'center' });
    doc.moveDown(2);

    const tableTop = 100;
    const rowHeight = 20;
    const columnWidths = [40, 130, 90, 130, 100]; // Tổng: 490 < 495
    const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
    let y = tableTop;

    // Vẽ header
    doc.fontSize(12).font('TimesNewRomanFont');
    let x = 50;
    doc.rect(x, y, tableWidth, rowHeight).fillAndStroke('#f0f0f0', '#000');
    data.headers.forEach((header, index) => {
      doc.fillColor('black').text(header, x + 5, y + 5, {
        width: columnWidths[index],
        align: 'left',
      });
      x += columnWidths[index];
    });

    // Vẽ đường dọc phân cách cột trong header
    x = 50;
    for (let i = 0; i < columnWidths.length - 1; i++) {
      x += columnWidths[i];
      doc
        .moveTo(x, y)
        .lineTo(x, y + rowHeight)
        .stroke();
    }
    y += rowHeight;

    // Vẽ các dòng dữ liệu
    doc.fontSize(10);
    for (const row of data.rows) {
      x = 50;
      doc.rect(x, y, tableWidth, rowHeight).stroke();
      Object.values(row).forEach((value, index) => {
        doc.text(String(value) || 'N/A', x + 5, y + 5, {
          // Ép kiểu thành string
          width: columnWidths[index],
          align: 'left',
        });
        x += columnWidths[index];
      });

      // Vẽ đường dọc phân cách cột trong dòng
      x = 50;
      for (let i = 0; i < columnWidths.length - 1; i++) {
        x += columnWidths[i];
        doc
          .moveTo(x, y)
          .lineTo(x, y + rowHeight)
          .stroke();
      }

      y += rowHeight;

      if (y > doc.page.height - 50) {
        doc.addPage();
        y = tableTop;
        x = 50;
        doc.rect(x, y, tableWidth, rowHeight).fillAndStroke('#f0f0f0', '#000');
        data.headers.forEach((header, index) => {
          doc.fillColor('black').text(header, x + 5, y + 5, {
            width: columnWidths[index],
            align: 'left',
          });
          x += columnWidths[index];
        });
        x = 50;
        for (let i = 0; i < columnWidths.length - 1; i++) {
          x += columnWidths[i];
          doc
            .moveTo(x, y)
            .lineTo(x, y + rowHeight)
            .stroke();
        }
        y += rowHeight;
      }
    }

    doc.end();
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log('PDF generated at:', filePath);
        resolve();
      });
      writeStream.on('error', (err) => {
        console.error('Error writing PDF:', err);
        reject(err);
      });
    });
  }
}
