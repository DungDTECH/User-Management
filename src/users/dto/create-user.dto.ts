import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { USER_ROLE } from 'src/shared/enums';

export class CreateUserDto {
  @ApiProperty({ example: 'user001', description: 'Unique user identifier' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address (required)',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description:
      'User password (min 8 characters, must contain uppercase, lowercase, number)',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must not exceed 32 characters' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
  })
  password: string;

  @ApiProperty({ enum: USER_ROLE, example: USER_ROLE.USER })
  @IsNotEmpty()
  role: USER_ROLE;
}
