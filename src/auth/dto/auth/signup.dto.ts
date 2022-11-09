import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty({
    message: 'email must be provided',
  })
  email: string;

  @IsString()
  @IsNotEmpty({
    message: 'username must be provided',
  })
  username: string;

  @IsString()
  @IsNotEmpty({
    message: 'password must be provided',
  })
  password: string;
}
