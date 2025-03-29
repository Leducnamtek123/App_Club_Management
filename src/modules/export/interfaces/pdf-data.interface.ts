export interface PdfData {
  title: string;
  headers: string[];
  rows: Array<{ [key: string]: string | Buffer }>;
}
