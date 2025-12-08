import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Login DTO - Dữ liệu đăng nhập
 *
 * Dùng cho endpoint: POST /auth/login
 */
export class LoginDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString({ message: 'Password phải là chuỗi' })
  @IsNotEmpty({ message: 'Password không được để trống' })
  @MinLength(8, { message: 'Password phải có ít nhất 8 ký tự' })
  password: string;
}

/**
 * Login Response DTO - Dữ liệu trả về sau khi login thành công
 */
export class LoginResponseDto {
  access_token: string;
  expires_in: string;
  user: {
    userId: string;
    email: string;
    name: string;
    role: string;
  };
}


