import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
