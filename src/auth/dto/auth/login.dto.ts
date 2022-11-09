import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty({
    message: 'email can not be empty',
  })
  email: string;

  @IsString()
  @IsNotEmpty({
    message: 'password can not be empty',
  })
  password: string;
}
