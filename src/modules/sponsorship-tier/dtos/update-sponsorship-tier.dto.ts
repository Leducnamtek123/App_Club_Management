import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import {
  StringFieldOptional,
  NumberFieldOptional,
} from '../../../decorators/field.decorators';
import { SponsorshipTier } from '../../../constants/enum/sponsorship-tier.enum';

export class UpdateSponsorshipTierDto {
  @ApiPropertyOptional({
    enum: SponsorshipTier,
    description: 'Tên mức tài trợ (Kim cương, Vàng, ...)',
  })
  @IsOptional()
  @IsEnum(SponsorshipTier, {
    message: 'Tên phải là một trong các giá trị: Kim cương, Vàng, Bạc, Đồng',
  })
  @StringFieldOptional({ nullable: true })
  name?: SponsorshipTier;

  @ApiPropertyOptional({ description: 'Số tiền tối thiểu (triệu VNĐ)' })
  @IsOptional()
  @NumberFieldOptional({ nullable: true })
  minAmount?: number;
}
