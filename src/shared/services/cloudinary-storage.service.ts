import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from '../../interfaces/IStorageService';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryStorageService implements IStorageService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, uploadResult) => {
          if (error) {
            reject(new Error(error.message || 'Upload failed'));

            return;
          }

          if (!uploadResult) {
            reject(new Error('Upload failed, result is undefined'));

            return;
          }

          resolve(uploadResult.secure_url);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
