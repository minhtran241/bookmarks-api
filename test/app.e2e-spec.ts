import {
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { SignupDto, LoginDto } from '../src/auth/dto';

describe('App e2e', () => {
  const config = new ConfigService();
  const appPort = config.getOrThrow('APP_PORT');
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(appPort);

    prisma = app.get(PrismaService);
    await prisma.cleanDB();
    pactum.request.setBaseUrl(`http://localhost:${appPort}`);
  });
  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      it('Signup Request Body must be provided', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('Signup Email and Username must be provided', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody({
            password: 'password',
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('Signup Password must be provided', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody({
            username: 'user test1',
            email: 'test1@example.com',
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('Signup Success', () => {
        const dto: SignupDto = {
          username: 'user test1',
          email: 'test1@example.com',
          password: 'password',
        };
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED);
      });
    });

    describe('Login', () => {
      it('Login Request Body must be provided', () => {
        return pactum
          .spec()
          .post(`/auth/login`)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('Login Email must be provided', () => {
        return pactum
          .spec()
          .post(`/auth/login`)
          .withBody({
            password: 'password',
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('Login Password must be provided', () => {
        return pactum
          .spec()
          .post(`/auth/login`)
          .withBody({
            email: 'test1@example.com',
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('Login Success', () => {
        const dto: LoginDto = {
          email: 'test1@example.com',
          password: 'password',
        };
        return pactum
          .spec()
          .post(`/auth/login`)
          .withBody(dto)
          .expectStatus(HttpStatus.OK);
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {});

    describe('Edit user', () => {});
  });

  describe('Bookmark', () => {
    describe('Create bookmark', () => {});

    describe('Get bookmarks', () => {});

    describe('Get bookmark by ID', () => {});

    describe('Edit bookmark', () => {});

    describe('Delete bookmark', () => {});
  });
});
