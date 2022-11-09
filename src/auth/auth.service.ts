import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import slugify from 'slugify';
import { SignupDto, LoginDto } from './dto';
import {
  NotFoundError,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: SignupDto) {
    // generate the password hash
    const hash = await argon2.hash(dto.password);
    // generate the slug based on email
    const slug = slugify(dto.username);
    // save the new user in the db
    try {
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
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        // if try to create new record with the unique field that has been violated
        if (err.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw err;
    }
  }

  async login(dto: LoginDto) {
    try {
      // find the user by email
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          email: dto.email,
        },
      });
      // compare password
      const pwMatches = await argon2.verify(user.hash, dto.password);
      // if password incorrect throw exception
      if (!pwMatches) {
        throw new NotFoundError('Incorrect credentials');
      }
      // send back the user
      delete user.hash;
      return user;
    } catch (err) {
      // if user does not exist throw exception
      if (err instanceof NotFoundError) {
        throw new ForbiddenException('Incorrect credentials');
      }
      throw new ForbiddenException(err.message);
    }
  }
}
