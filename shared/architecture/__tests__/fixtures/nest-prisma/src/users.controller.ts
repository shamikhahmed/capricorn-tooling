import { Controller, Get, Post } from '@nestjs/common';
@Controller('users')
export class UsersController {
  @Get()
  list() { return prisma.user.findMany(); }
  @Post()
  create() { return prisma.user.create({ data: {} }); }
}
