import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    try {
      super({
        datasources: {
          db: {
            url: config.getOrThrow('DATABASE_URL'),
          },
        },
      });
    } catch (err) {
      throw err;
    }
  }
}
