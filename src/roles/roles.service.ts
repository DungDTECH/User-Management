import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '../entities/role.entity';
import { USER_ROLE } from 'src/shared/enums';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Check if role already exists
    const existingRole = await this.roleRepository.findOne({
      where: { level: createRoleDto.level },
    });

    if (existingRole) {
      throw new ConflictException(
        `Role with level ${createRoleDto.level} already exists`,
      );
    }

    const newRole = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(newRole);
  }

  async findAll(includeInactive: boolean = false): Promise<Role[]> {
    if (includeInactive) {
      return this.roleRepository.find();
    }
    return this.roleRepository.find({ where: { isActive: true } });
  }

  async findByLevel(level: USER_ROLE): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { level } });
    if (!role) {
      throw new NotFoundException(`Role with level ${level} not found`);
    }
    return role;
  }

  async update(level: USER_ROLE, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findByLevel(level);

    // Prevent changing the level (primary key)
    if (updateRoleDto.level && updateRoleDto.level !== level) {
      throw new BadRequestException('Cannot change role level');
    }

    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async remove(level: USER_ROLE): Promise<Role> {
    const role = await this.findByLevel(level);
    role.isActive = false;
    return this.roleRepository.save(role);
  }
}
