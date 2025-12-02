import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/user.dto';
import { DatabaseService } from '../database/database.service';
import { RegisterDTO, UserResponseDTO } from '../auth/dto/auth.dto';
import { User } from 'generated/prisma';
import { removeFields } from 'src/utils/object.util';
import { PaginatedResult, PaginationQueryType } from 'src/types/util.types';


@Injectable()
export class UserService {
  constructor( private readonly prismaServise : DatabaseService) {}

   create(registerDTO: RegisterDTO) {
   return this.prismaServise.user.create({
      data: registerDTO
    }
  )}

  findByEmail(email: string) {
    return this.prismaServise.user.findUnique({
      where: {
        email
      }
    });
  }
 
  
findAll(
    query: PaginationQueryType,
  ): Promise<PaginatedResult<Omit<User, 'password'>>> {
    return this.prismaServise.$transaction(async (prisma) => {
    // Step 1: Extract pagination values from query
    // page -> current page number
    // skip -> how many items to skip
    // take -> how many items to return
      const pagination = this.prismaServise.handleQueryPagination(query);
    // Step 2: Get all users with pagination
    // - "skip" and "take" are added using spread operator
    // - "page" is removed because Prisma does not accept it
    // - "omit" is used to hide the password field
      const users = await prisma.user.findMany({
        ...removeFields(pagination, ['page']),
        orderBy: { createdAt: 'desc' },
        omit: {
          password: true,
        },
      });
      // Step 3: Get the total number of users
      const count = await prisma.user.count();
      // Step 4: Build pagination metadata
      const meta = this.prismaServise.formatPaginationResponse({
        page: pagination.page,
        count,
        limit: pagination.take,
      });
    // Step 5: Return data + meta
      return {
        data: users,
        ...meta,
      };
    });
  }

  findOne(id: bigint) {
    return this.prismaServise.user.findUnique({
      where: {
        id
      },
      omit : {
        password : true
      }
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prismaServise.user.update({
      where: {
        id: BigInt(id)
      },
      data: updateUserDto,
      omit: { password: true }
    });
  }

  remove(id: number) {
    return this.prismaServise.user.update({
      where: {id: BigInt(id)},
      data: { isDeleted: true },
    });
  }

  mapUserWithoutPasswordAndCastBigint(user: User): UserResponseDTO['user'] {
    const userWithoutPassword = removeFields(user, ['password']);
    return {  ...userWithoutPassword,
       id: String(userWithoutPassword.id)};
  }
}
