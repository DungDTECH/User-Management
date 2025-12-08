import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../entities/user.entity';
import { USER_ROLE } from 'src/shared/enums';
import { AuthRolesGuard } from 'src/auth/guards/auth-roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'Admin only. First user can be created without authentication.',
  })
  @UseGuards(AuthRolesGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiResponse({ status: 201, description: 'User created', type: User })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of users', type: [User] })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':userId')
  @UseGuards(AuthRolesGuard)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'userId', description: 'User identifier' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only access own data',
  })
  findOne(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: any,
  ): Promise<User> {
    if (currentUser.role !== USER_ROLE.ADMIN && currentUser.userId !== userId) {
      throw new ForbiddenException('You can only access your own data');
    }

    return this.userService.findOne(userId);
  }

  @Post(':userId')
  @UseGuards(AuthRolesGuard)
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'userId', description: 'User identifier' })
  @ApiResponse({ status: 200, description: 'User updated', type: User })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own data',
  })
  update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ): Promise<User> {
    if (currentUser.role !== USER_ROLE.ADMIN && currentUser.userId !== userId) {
      throw new ForbiddenException('You can only update your own data');
    }

    return this.userService.update(userId, updateUserDto);
  }

  @Delete(':userId')
  @UseGuards(AuthRolesGuard)
  @Roles(USER_ROLE.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'userId', description: 'User identifier' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  remove(@Param('userId') userId: string): Promise<void> {
    return this.userService.remove(userId);
  }

  /**
   * Upload Avatar
   * User có thể upload avatar của chính họ
   * Admin có thể upload avatar cho bất kỳ user nào
   */
  @Post(':userId/avatar')
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          // Generate unique filename: userId-timestamp.ext
          const userId = req.params.userId;
          const timestamp = Date.now();
          const ext = extname(file.originalname);
          callback(null, `${userId}-${timestamp}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Only accept images
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
    }),
  )
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'userId', description: 'User identifier' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid file' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only upload own avatar',
  })
  async uploadAvatar(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: any,
  ) {
    // User chỉ upload được avatar của chính họ, Admin upload được cho ai cũng được
    if (currentUser.role !== USER_ROLE.ADMIN && currentUser.userId !== userId) {
      throw new ForbiddenException('You can only upload your own avatar');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Update user avatar path trong database
    const updatedUser = await this.userService.updateAvatar(
      userId,
      file.filename,
    );

    return {
      message: 'Avatar uploaded successfully',
      avatar: file.filename,
      url: `/uploads/avatars/${file.filename}`,
      user: {
        userId: updatedUser.userId,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
      },
    };
  }
}
