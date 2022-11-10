# ![Nest Example App](project-logo.png)

> ### NestJS Bookmarks API (CRUD, auth, advanced patterns, etc) withe E2E Testing

---

## Getting started

### Installation

Clone the repository

    git clone https://github.com/minhtran241/bookmarks-api.git

Switch to the repo folder

    cd bookmarks-api

Install dependencies

    yarn install

Copy .env.example file to your .env file and set environment variables following instructions in the [.env.example](https://github.com/minhtran241/bookmarks-api/blob/main/.env.example) file (jwt, database, port information)

    touch .env

---

### Database

The codebase contains [Prisma](https://www.prisma.io/) database abstraction

---

##### Prisma

---

Trigger docker image for PostgreSQL

    yarn db:dev:up

Apply pending migrations to the database in production/staging

    yarn prisma:dev:deploy

Browse your data

    npx prisma studio

In case of you want to generate your own database from scratch, set up tables and generate the prisma client. For more information see the docs:

- https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases-typescript-postgres

---

### Yarn scripts

- `yarn start` - Start application
- `yarn start:dev` - Start application in watch mode
- `yarn test:e2e` - run E2E test runner
- `yarn start:prod` - Build application

### Docker development and testing scripts

- `yarn db:dev:up` - Start PostgreSQL container
- `yarn db:dev:rm` - Remove PostgreSQL container
- `yarn db:dev:restart` - Restart PostgreSQL container and apply pending migrations to the database in production/staging
- `yarn db:test:up` - Start PostgreSQL container for testing
- `yarn db:test:rm` - Remove PostgreSQL container for testing
- `yarn db:test:restart` - Restart PostgreSQL container for testing and apply pending migrations to the database in production/staging

---

## Authentication

This applications uses JSON Web Token (JWT) to handle authentication. The token is passed with each request using the `Authorization` header with `Token` scheme. The JWT authentication middleware handles the validation and authentication of the token. Please check the following sources to learn more about [JWT](https://jwt.io)

---

## Project structure

[src](https://github.com/minhtran241/bookmarks-api/tree/main/src) folder contains logic for all the modules, [test](https://github.com/minhtran241/bookmarks-api/tree/main/test) folder contains logic for testing of the project

---

### Modules

```
.
├── app.module.ts
├── auth
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── decorator
│   │   ├── get-user.decorator.ts
│   │   └── index.ts
│   ├── dto
│   │   ├── auth
│   │   │   ├── login.dto.ts
│   │   │   └── signup.dto.ts
│   │   └── index.ts
│   ├── guard
│   │   ├── index.ts
│   │   └── jwt.guard.ts
│   └── strategy
│       ├── index.ts
│       └── jwt.strategy.ts
├── bookmark
│   ├── bookmark.controller.ts
│   ├── bookmark.module.ts
│   ├── bookmark.service.ts
│   └── dto
│       ├── create-bookmark.dto.ts
│       ├── edit-bookmark.dto.ts
│       └── index.ts
├── main.ts
├── prisma
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── user
    ├── dto
    │   ├── edit-user.dto.ts
    │   └── index.ts
    ├── user.controller.ts
    ├── user.module.ts
    └── user.service.ts
```

---

### E2E Testing

- File [.env.test](https://github.com/minhtran241/bookmarks-api/blob/main/.env.test) contains environment variables for testing

```
.
├── app.e2e-spec.ts
└── jest-e2e.json
```
