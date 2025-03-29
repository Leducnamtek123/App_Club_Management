import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { BranchEntity } from '../branch.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UserSimpleDto } from '../../user/dtos/user-simple.dto';

export class BranchDto extends AbstractDto {
  @ApiProperty({ description: 'Tên chi hội' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Mô tả chi hội', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Thông tin chi hội trưởng',
    required: false,
  })
  leader?: UserSimpleDto;

  constructor(branch: BranchEntity) {
    super(branch);
    this.name = branch.name;
    this.description = branch.description;
    this.leader = branch.leader ? new UserSimpleDto(branch.leader) : undefined;
  }
}
