import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import slugify from 'slugify';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: AuthDto) {
    // generate the password hash
    const hash = await argon2.hash(dto.password);
    // generate the slug based on username
    const slug = slugify(dto.username);
    // save the new user in the db
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        slug,
        email: dto.email,
        hash,
      },
    });
    delete user.hash;
    // return the saved user
    return user;
  }
  login() {
    return 'h';
  }
}
