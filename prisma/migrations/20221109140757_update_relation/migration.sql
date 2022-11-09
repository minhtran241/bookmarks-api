/*
 Warnings:
 
 - You are about to drop the `Bookmark` table. If the table is not empty, all the data it contains will be lost.
 - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
 
 */
-- DropTable
DROP TABLE "Bookmark";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users"
(
  "id" SERIAL NOT NULL,
  "username" TEXT NOT NULL,
  "slug" VARCHAR(200) NOT NULL,
  "email" TEXT NOT NULL,
  "hash" TEXT NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks"
(
  "id" SERIAL NOT NULL,
  "title" VARCHAR(50) NOT NULL,
  "slug" VARCHAR(200) NOT NULL,
  "description" VARCHAR(100),
  "link" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" INTEGER NOT NULL,
  CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_slug_key" ON "users"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_title_key" ON "bookmarks"("title");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_slug_key" ON "bookmarks"("slug");

-- AddForeignKey
ALTER TABLE
  "bookmarks"
ADD
  CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE RESTRICT ON
UPDATE CASCADE;