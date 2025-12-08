import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ROLES_KEY } from '../../shared/constants';
import { USER_ROLE } from '../../shared/enums';
import { User } from '../../entities/user.entity';

@Injectable()
export class AuthRolesGuard extends AuthGuard('jwt') implements CanActivate {
  private readonly logger = new Logger(AuthRolesGuard.name);

  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Kiểm tra nếu là endpoint POST /users và chưa có user nào trong DB
    // Cho phép tạo user đầu tiên mà không cần authentication
    // NHƯNG BẮT BUỘC user đầu tiên phải có role ADMIN
    if (request.method === 'POST' && request.route.path === '/users') {
      const userCount = await this.userRepository.count();
      if (userCount === 0) {
        const { role } = request.body;

        if (!role || role !== USER_ROLE.ADMIN) {
          // Log chi tiết vào terminal
          this.logger.error(
            `Failed to create first user: Role must be ADMIN, received: ${role || 'undefined'}`,
          );

          // Trả lỗi chung cho API
          throw new BadRequestException('Invalid parameters');
        }

        // User đầu tiên có role ADMIN, cho phép tạo
        this.logger.log('Creating first user with ADMIN role');
        return true;
      }
    }

    const authenticated = await super.canActivate(context);
    if (!authenticated) {
      throw new UnauthorizedException('Authentication failed');
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new UnauthorizedException('User has no assigned role');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'This action require permission ' + requiredRoles[0],
      );
    }

    return true;
  }
}
