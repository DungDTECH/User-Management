import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from '../../src/entities/role.entity';
import { USER_ROLE } from 'src/shared/enums';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { AuthRolesGuard } from 'src/auth/guards/auth-roles.guard';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @UseGuards(AuthRolesGuard)
  @Roles(USER_ROLE.ADMIN) 
  @ApiResponse({
    status: 201,
    description: 'The role has been successfully created.',
    type: Role,
  })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: 200,
    description: 'List of all roles',
    type: [Role],
  })
  findAll() {
    return this.rolesService.findAll();
  }


  @Get('level/:level')
  @ApiOperation({ summary: 'Get a role by level' })
  @ApiResponse({
    status: 200,
    description: 'The found role',
    type: Role,
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  findByLevel(@Param('level') level: USER_ROLE) {
    return this.rolesService.findByLevel(level);
  }

  @Post(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(USER_ROLE.ADMIN) 
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully updated.',
    type: Role,
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  update(@Param('id') level: USER_ROLE, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(level, updateRoleDto);
  }

  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(USER_ROLE.ADMIN)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully deleted.',
    type: Role,
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  remove(@Param('id') level: USER_ROLE) {
    return this.rolesService.remove(level);
  }
}
