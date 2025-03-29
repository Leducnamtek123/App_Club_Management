
export interface IStorageService {
  /**
   * Upload tệp lên dịch vụ lưu trữ
   * @param file Tệp từ Multer
   * @param path Đường dẫn lưu trữ trên dịch vụ (ví dụ: "events/event-title/images")
   * @returns URL của tệp đã upload
   */
  uploadFile(file: Express.Multer.File, path: string): Promise<string>;

  /**
   * Xóa tệp khỏi dịch vụ lưu trữ
   * @param fileUrl URL của tệp cần xóa
   */
  deleteFile(fileUrl: string): Promise<void>;
}
