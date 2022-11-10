import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';
import { User, Bookmark } from '@prisma/client';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async getBookmarks(userId: number): Promise<Bookmark[]> {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  async getBookmarkById(
    userId: number,
    bookmarkId: number,
  ): Promise<Bookmark> {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });
    if (!bookmark) throw new NotFoundException('Resource not found');
    return bookmark;
  }

  async createBookmark(
    user: User,
    dto: CreateBookmarkDto,
  ): Promise<Bookmark> {
    const slug = slugify(`${user.username} ${dto.title}`);
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId: user.id,
        slug,
        ...dto,
      },
    });
    return bookmark;
  }

  async editBookmarkById(
    user: User,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ): Promise<Bookmark> {
    // get the bookmark by id
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    if (!bookmark) throw new NotFoundException('Resource not found');
    // check if user owns the bookmark
    if (bookmark.userId !== user.id)
      throw new ForbiddenException('Access resource denied');
    const slug = dto.title
      ? slugify(`${user.username} ${dto.title}`)
      : bookmark.slug;

    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        slug,
        ...dto,
      },
    });
  }

  async deleteBookmarkById(
    userId: number,
    bookmarkId: number,
  ): Promise<void> {
    // get the bookmark by id
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    if (!bookmark) throw new NotFoundException('Resource not found');
    // check if user owns the bookmark
    if (bookmark.userId !== userId)
      throw new ForbiddenException('Access resource denied');

    await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
