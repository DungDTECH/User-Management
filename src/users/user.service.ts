import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource, // ← Inject DataSource để dùng transaction
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingById = await this.userRepository.findOne({
      where: { userId: createUserDto.userId },
    });
    if (existingById) {
      throw new ConflictException(
        `User with ID ${createUserDto.userId} already exists`,
      );
    }

    const user = this.userRepository.create({ ...createUserDto });
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(userId);

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(userId: string): Promise<void> {
    const user = await this.findOne(userId);
    await this.userRepository.remove(user);
  }

  /**
   * Update User Avatar
   * Cập nhật avatar filename vào database
   */
  async updateAvatar(userId: string, filename: string): Promise<User> {
    const user = await this.findOne(userId);
    user.avatar = filename;
    return await this.userRepository.save(user);
  }
}
