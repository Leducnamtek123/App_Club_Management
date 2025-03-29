import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketStatus } from '../../constants/enum/ticket-status.enum';
import { EventEntity } from '../event/event.entity';
import { UserEntity } from '../user/user.entity';
import { ZnsService } from '../zns/zns.service';
import { TicketEntity } from './ticket.entity';
import * as QRCode from 'qrcode';
import { TicketDto } from './dtos/ticket.dto';
import { TicketsPageOptionsDto } from './dtos/tickets-page-options.dto';
import { PageDto } from 'common/dto/page.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(TicketEntity)
    private ticketRepo: Repository<TicketEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(EventEntity)
    private eventRepo: Repository<EventEntity>,
    private znsService: ZnsService,
    private configService: ConfigService,
  ) {}

  async registerForEvent(userId: Uuid, eventId: Uuid) {
    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
    const event = await this.eventRepo.findOneOrFail({
      where: { id: eventId },
    });

    const ticket = this.ticketRepo.create({
      user,
      event,
      status:
        event.ticketPrice === 0 ? TicketStatus.VALID : TicketStatus.PENDING,
    });

    if (event.ticketPrice === 0) {
      // Sự kiện miễn phí: Tạo QR và gửi ZNS ngay
      ticket.qrCode = await this.generateQrCode(ticket.id);
      await this.ticketRepo.save(ticket);
      await this.sendTicketNotification(user.zaloId!, ticket, event);
    } else {
      await this.ticketRepo.save(ticket);
    }

    return ticket.toDto();
  }

  async confirmPayment(ticketId: Uuid): Promise<TicketDto> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['user', 'event'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }

    if (ticket.status !== TicketStatus.PENDING) {
      throw new BadRequestException('Ticket is not in PENDING status');
    }

    ticket.status = TicketStatus.VALID;
    ticket.qrCode = await this.generateQrCode(ticket.id);
    await this.ticketRepo.save(ticket);

    // Chỉ gửi thông báo nếu user có zaloId
    if (ticket.user.zaloId) {
      await this.sendTicketNotification(ticket.user.zaloId, ticket, ticket.event);
    }

    return ticket.toDto();
  }

  private async generateQrCode(ticketId: string): Promise<string> {
    const qrData = `ticket:${ticketId}`;
    return await QRCode.toDataURL(qrData);
  }

  private async sendTicketNotification(
    zaloId: string,
    ticket: TicketEntity,
    event: EventEntity,
  ) {
    const templateId = this.configService.get<string>(
      'ZNS_TICKET_CONFIRMATION_TEMPLATE_ID',
    );
    if (!templateId) {
      throw new Error("Can't get ZNS_TICKET_CONFIRMATION_TEMPLATE_ID");
    }
    const templateData: Record<string, string> = {
      event_title: event.title,
      start_date: event.startDate!.toISOString().split('T')[0],
      end_date: event.endDate!.toISOString().split('T')[0],
      qr_code: ticket.qrCode!,
    };
    await this.znsService.queueSend(zaloId, templateId, templateData);
  }


  async getTicketsByUser(
    userId: Uuid,
    pageOptionsDto: TicketsPageOptionsDto,
  ): Promise<PageDto<TicketDto>> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy hội viên với ID ${userId}`);
    }

    const queryBuilder = this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.event', 'event')
      .where('ticket.user_id = :userId', { userId });

    // Nếu có eventId trong query, thêm điều kiện lọc
    if (pageOptionsDto.eventId) {
      queryBuilder.andWhere('ticket.event_id = :eventId', {
        eventId: pageOptionsDto.eventId,
      });
    }

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);
    return items.toPageDto(pageMetaDto);
  }
}
