import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import slugify from 'slugify';
import { SignupDto, LoginDto } from './dto';
import {
  NotFoundError,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<{ access_token: string }> {
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
      // return signed jwt
      return this.signToken(user.id, user.email);
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

  async login(dto: LoginDto): Promise<{ access_token: string }> {
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
      // return signed jwt
      return this.signToken(user.id, user.email);
    } catch (err) {
      // if user does not exist throw exception
      if (err instanceof NotFoundError) {
        throw new ForbiddenException('Incorrect credentials');
      }
      throw new ForbiddenException(err.message);
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn:
        this.config.getOrThrow('JWT_EXPIRATION_IN_MINUTES') + 'm',
      secret: this.config.getOrThrow('JWT_SECRET'),
    });

    return {
      access_token: token,
    };
  }
}
