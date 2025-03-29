import { ApiProperty } from '@nestjs/swagger';
import { StringField, NumberField } from '../../../decorators/field.decorators';
import { IsEnum } from 'class-validator';
import { SponsorshipTier } from '../../../constants/enum/sponsorship-tier.enum';

export class CreateSponsorshipTierDto {
  @ApiProperty({
    enum: SponsorshipTier,
    description: 'Tên mức tài trợ (Kim cương, Vàng, ...)',
  })
  @IsEnum(SponsorshipTier, {
    message: 'Tên phải là một trong các giá trị: Kim cương, Vàng, Bạc, Đồng',
  })
  @StringField({ nullable: false })
  name!: SponsorshipTier;

  @ApiProperty({ description: 'Số tiền tối thiểu (triệu VNĐ)' })
  @NumberField({ nullable: false })
  minAmount!: number;

  @ApiProperty({ description: 'ID sự kiện' })
  @StringField({ nullable: false })
  eventId!: Uuid;
}
