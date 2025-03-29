// src/modules/events/dto/event.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractDto } from '../../../common/dto/abstract.dto';
import { EventEntity } from '../event.entity';
import { BranchDto } from '../../branch/dtos/branch.dto';
import { UserDto } from '../../user/dtos/user.dto';
import { EventStatus } from '../../../constants/enum/event-status.enum';
import { EnumField } from '../../../decorators/field.decorators';

export class EventDto extends AbstractDto {
    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    startDate: Date;

    @ApiProperty()
    endDate: Date;

    @ApiPropertyOptional()
    ticketClosingDate?: Date;

    @ApiProperty()
    location: string;

    @ApiProperty({ type: () => BranchDto, nullable: true })
    branch?: BranchDto;

    @ApiProperty({ nullable: true })
    branch_id?: string;

    @EnumField(() => EventStatus)
    status!: EventStatus;

    @ApiProperty()
    ticketPrice: number;

    @ApiProperty({ type: [String], nullable: true })
    images?: string[];

    @ApiProperty({ type: () => UserDto, nullable: true })
    createdBy?: UserDto;

    constructor(entity: EventEntity) {
        super(entity);
        this.title = entity.title;
        this.description = entity.description;
        this.startDate = entity.startDate!;
        this.endDate = entity.endDate!;
        this.ticketClosingDate = entity.ticketClosingDate;
        this.location = entity.location;
        this.branch = entity.branch ? entity.branch.toDto() : undefined;
        this.branch_id = entity.branch_id;
        this.status = entity.status;
        this.ticketPrice = entity.ticketPrice;
        this.images = entity.images;
        this.createdBy = entity.createdBy ? entity.createdBy.toDto() : undefined;
    }
}
