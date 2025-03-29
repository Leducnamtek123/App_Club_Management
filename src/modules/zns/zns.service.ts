import { HttpService } from '@nestjs/axios';
import { InjectQueue, Process } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Job } from 'bull';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ZnsService {
  private readonly logger = new Logger(ZnsService.name);
  private readonly znsUrl = 'https://openapi.zalo.me/v2.0/oa/message';
  private readonly accessToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectQueue('zns') private znsQueue: Queue,
  ) {
    if (!this.configService.get<string>('ZNS_ACCESS_TOKEN')) {
      throw new Error("Can't get ZNS_ACCESS_TOKEN");
    }
    this.accessToken = this.configService.get<string>('ZNS_ACCESS_TOKEN')!;
  }

  async queueSend(
    zaloId: string,
    templateId: string,
    templateData: Record<string, string>,
  ) {
    await this.znsQueue.add(
      'send-zns',
      { zaloId, templateId, templateData },
      { attempts: 3, backoff: 5000 },
    );
  }

  @Process('send-zns')
  async processZnsJob(
    job: Job<{
      zaloId: string;
      templateId: string;
      templateData: Record<string, string>;
    }>,
  ) {
    const { zaloId, templateId, templateData } = job.data;
    const payload = {
      recipient: { user_id: zaloId },
      message: { template_id: templateId, template_data: templateData },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.znsUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            access_token: this.accessToken,
          },
        }),
      );
      if (response.data.error !== 0) throw new Error(response.data.message);
      this.logger.log(`ZNS sent to ${zaloId} with template ${templateId}`);
    } catch (error) {
      this.logger.error(`Failed to send ZNS to ${zaloId}: ${error}`);
      throw error;
    }
  }
}
