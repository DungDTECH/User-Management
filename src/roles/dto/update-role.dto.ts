import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { USER_ROLE } from '../../shared/enums';

export class UpdateRoleDto {
  @ApiProperty({
    enum: USER_ROLE,
    example: USER_ROLE.USER,
    description: 'The role level',
    required: false,
  })
  @IsOptional()
  @IsEnum(USER_ROLE)
  level?: USER_ROLE;

  @ApiProperty({
    example: true,
    description: 'Whether the role is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
