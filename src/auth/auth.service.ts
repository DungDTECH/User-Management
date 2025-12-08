import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { LoginDto, LoginResponseDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

/**
 * Auth Service - Xử lý logic authentication
 *
 * Chức năng:
 * 1. Login: Validate email/password → Generate JWT token
 * 2. Validate user credentials
 * 3. Generate JWT access token
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Login - Đăng nhập và trả về JWT token
   *
   * FLOW:
   * 1. Tìm user theo email (bao gồm password field)
   * 2. Kiểm tra user có tồn tại không
   * 3. Kiểm tra account có active không
   * 4. Validate password với bcrypt.compare()
   * 5. Tạo JWT payload
   * 6. Sign token với JwtService
   * 7. Return token + user info
   *
   * @param loginDto - Email và password từ client
   * @returns LoginResponseDto với access_token và user info
   * @throws UnauthorizedException nếu credentials invalid
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: ['userId', 'email', 'name', 'role', 'password', 'isActive'],
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc password không đúng');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc password không đúng');
    }

    const payload: JwtPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      expires_in: process.env.JWT_EXPIRES_IN || '1h',
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['userId', 'email', 'name', 'role', 'password', 'isActive'],
    });

    if (!user) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * Generate Token - Tạo JWT token từ user object
   *
   * Hữu ích cho:
   * - Refresh token flow
   * - Generate token sau khi register
   * - Testing purposes
   *
   * @param user - User object (phải có userId, email, role)
   * @returns JWT access token string
   */
  generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Verify Token - Kiểm tra token có hợp lệ không
   *
   * Dùng để:
   * - Manual token verification
   * - Debug token issues
   * - Token introspection endpoints
   *
   * @param token - JWT token string
   * @returns Decoded payload nếu valid
   * @throws Error nếu token invalid hoặc expired
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}