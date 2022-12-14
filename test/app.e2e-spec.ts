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
import { EditUserDto } from '../src/user/dto';
import {
  CreateBookmarkDto,
  EditBookmarkDto,
} from '../src/bookmark/dto';

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
          .post('/auth/signup')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('Signup Email and Username must be provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: 'password',
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('Signup Password must be provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
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
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED);
      });
    });

    describe('Login', () => {
      it('Login Request Body must be provided', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('Login Email must be provided', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            password: 'password',
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('Login Password must be provided', () => {
        return pactum
          .spec()
          .post('/auth/login')
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
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .stores('userAccessToken', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('Get Current User unauthorized', () => {
        return pactum
          .spec()
          .get('/users/me')
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });

      it('Get Current User success', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(HttpStatus.OK);
      });
    });

    describe('Edit User success', () => {
      it('Edit User success', () => {
        const dto: EditUserDto = {
          firstName: 'User',
          lastName: 'Test1',
          email: 'testedit@example.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('Bookmark', () => {
    describe('Get Bookmarks', () => {
      it('Get Bookmarks success', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(0)
          .expectBody([]);
      });
    });

    describe('Create Bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'Title Bookmark Test1',
        description: 'Description Bookmark Test1',
        link: 'https://www.bookmark.com/test1',
      };
      it('Create Bookmarks success', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get Bookmark by ID', () => {
      it('Get Bookmark by ID success', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(HttpStatus.OK)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark by ID', () => {
      const dto: EditBookmarkDto = {
        title: 'Title Bookmark Test1 edited',
        description: 'Description Bookmark Test1 edited',
      };
      it('Edit Bookmark by ID success', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark by ID', () => {
      it('Delete Bookmark by ID success', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(HttpStatus.NO_CONTENT);
      });

      it('Get Empty Bookmark after Delete', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(HttpStatus.NOT_FOUND);
      });
    });
  });
});
