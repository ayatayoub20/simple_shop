import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UserService } from './user.service';
import type { RegisterDTO } from '../auth/dto/auth.dto';
import type { PaginationQueryType } from 'src/types/util.types';
import type { UpdateUserDto } from './dto/user.dto';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { UpdateUserValidationSchema } from './util/user.validation.schema';
import { paginationSchema } from 'src/utils/api.util';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() registerDto: RegisterDTO) {
    return this.userService.create(registerDto);
  }

  @Get()
  findAll(@Query(new ZodValidationPipe(paginationSchema)) 
  query:PaginationQueryType) {
    return this.userService.findAll({
      limit : Number(query.limit),
      page : Number(query.page)
    } as Required<PaginationQueryType>);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(BigInt(id));}

  @Patch(':id')
  update(@Param('id') id: string,
   @Body( new ZodValidationPipe(UpdateUserValidationSchema)) 
   updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);}

  @Delete(':id')
   async remove(@Param('id') id: string) {
    const removedUSer = await this.remove(id)
    return Boolean(removedUSer)
  }
}
