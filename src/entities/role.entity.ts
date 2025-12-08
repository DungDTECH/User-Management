import {
  Entity,
  Column,
  PrimaryColumn
} from 'typeorm';

import { USER_ROLE } from 'src/shared/enums';

@Entity('roles')
export class Role {
  @PrimaryColumn({ type: 'varchar' })
  level: USER_ROLE;


  @Column({ default: true })
  isActive: boolean;

}
