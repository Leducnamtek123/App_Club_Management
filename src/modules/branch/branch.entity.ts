import { Entity, Column, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity';
import { BranchDto } from './dtos/branch.dto';
import { UseDto } from '../../decorators/use-dto.decorator';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'branches' })
@UseDto(BranchDto)
export class BranchEntity extends AbstractEntity<BranchDto> {
  @Column({ type: 'varchar', nullable: false, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToOne(
    () => require('../user/user.entity').UserEntity,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'leader_id' })
  leader?: any;

  @OneToMany(
    () => require('../user/user.entity').UserEntity,
    (user : UserEntity) => user.branch,
    {
      onDelete: 'SET NULL',
    },
  )
  members?: any[];
}
