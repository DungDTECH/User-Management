import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/auth.dto';
import { AuthRolesGuard } from './guards/auth-roles.guard';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK) // 200 thay vì 201 (POST default)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(AuthRolesGuard)
  async getProfile(@CurrentUser() user: any) {
    return {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  @Post('logout')
  @UseGuards(AuthRolesGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    return {
      message: 'Logout successful.',
    };
  }
}
