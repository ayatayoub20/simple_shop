import { User } from "generated/prisma";

export type UpdateUserDto = Partial< Pick<User , 'email' | 'name'>>;