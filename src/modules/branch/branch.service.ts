import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchEntity } from './branch.entity';
import type { BranchDto } from './dtos/branch.dto';
import type { PageOptionsDto } from '../../common/dto/page-options.dto';
import type { PageDto } from '../../common/dto/page.dto';
import type { RequestBranchDto } from './dtos/request-branch.dto';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(BranchEntity)
    private branchRepository: Repository<BranchEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(createBranchDto: RequestBranchDto): Promise<BranchDto> {
    const { leaderId, ...branchData } = createBranchDto;

    const branch = this.branchRepository.create(branchData);

    if (leaderId) {
      const leader = await this.userRepository.findOne({
        where: { id: leaderId as Uuid },
      });
      if (!leader) {
        throw new NotFoundException(`User with ID ${leaderId} not found`);
      }
      branch.leader = leader;
      leader.branch = branch;
      await this.userRepository.save(leader);
    }

    await this.branchRepository.save(branch);
    return branch.toDto();
  }

  async getBranches(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<BranchDto>> {
    const queryBuilder = this.branchRepository
      .createQueryBuilder('branch')
      .leftJoinAndSelect('branch.leader', 'leader');

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    console.log('items', items);

    return items.toPageDto(pageMetaDto);
  }

  async getBranch(id: Uuid): Promise<BranchDto> {
    const branch = await this.branchRepository.findOne({
      where: { id },
      relations: ['leader'],
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return branch.toDto();
  }

  async update(
    id: Uuid,
    updateBranchDto: RequestBranchDto,
  ): Promise<BranchDto> {
    const branch = await this.branchRepository.findOne({
      where: { id },
      relations: ['leader'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    const { leaderId, ...branchData } = updateBranchDto;

    if (leaderId) {
      const newLeader = await this.userRepository.findOne({
        where: { id: leaderId as Uuid },
      });
      if (!newLeader) {
        throw new NotFoundException(`User with ID ${leaderId} not found`);
      }

      if (branch.leader && branch.leader.id !== newLeader.id) {
        const oldLeader = branch.leader;
        oldLeader.branch = undefined;
        await this.userRepository.save(oldLeader);
      }

      branch.leader = newLeader;
      newLeader.branch = branch;
      await this.userRepository.save(newLeader);
    } else if (leaderId === null && branch.leader) {
      const oldLeader = branch.leader;
      oldLeader.branch = undefined;
      await this.userRepository.save(oldLeader);
      branch.leader = undefined;
    }

    Object.assign(branch, branchData);
    await this.branchRepository.save(branch);
    return branch.toDto();
  }

  async remove(id: Uuid): Promise<void> {
    const branch = await this.branchRepository.findOne({
      where: { id },
      relations: ['leader'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    if (branch.leader) {
      branch.leader.branch = undefined;
      await this.userRepository.save(branch.leader);
    }

    await this.branchRepository.remove(branch);
  }
}
