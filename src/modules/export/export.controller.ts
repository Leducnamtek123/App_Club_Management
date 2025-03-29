// src/modules/export/export.controller.ts
import { Controller, Get, Query, Res, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExportService } from './export.service';
import { UserService } from '../user/user.service';
import { RoleType } from '../../constants/role-type';
import { Response } from 'express';
import * as fs from 'fs';
import { Auth } from '../../decorators/http.decorators';
import { ExportMembersPdfDto } from './interfaces/export-users-pdf.dto';

@ApiTags('Export')
@Controller('export')
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    private readonly userService: UserService,
  ) {}

  @Get('/members-pdf')
  @Auth([RoleType.ADMIN])
  @ApiOperation({ summary: 'Yêu cầu xuất danh sách thành viên dưới dạng PDF' })
  @ApiResponse({ status: 200, description: 'Trả về jobId và link tải PDF' })
  async exportMembersPdf(
    @Query() dto: ExportMembersPdfDto,
  ): Promise<{ jobId: string; downloadUrl: string }> {
    const pdfData = await this.userService.getMembersForPdf(dto);
    return this.exportService.queueExportToPdf(pdfData);
  }

  @Get('/downloads/:fileName')
  @Auth([RoleType.ADMIN])
  @ApiOperation({ summary: 'Tải file PDF đã tạo' })
  @ApiResponse({ status: 200, description: 'File PDF' })
  async downloadPdf(@Param('fileName') fileName: string, @Res() res: Response) {
    const filePath = `./uploads/${fileName}`;
    if (!fs.existsSync(filePath)) {
      res.status(404).send('File not found or still processing');
      return;
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    fs.createReadStream(filePath).pipe(res);
  }
}
