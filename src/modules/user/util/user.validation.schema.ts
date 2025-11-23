import { RegisterDTO } from 'src/modules/auth/dto/auth.dto';
import z, { ZodType } from 'zod';
import { UpdateUserDto } from '../dto/user.dto';

// base schema
export const userValidationSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email().toLowerCase(),
  password: z.string().min(6).max(100),
  role: z.enum(['MERCHANT', 'CUSTOMER']),
  isDeleted: z.boolean(),
}) satisfies ZodType<RegisterDTO>;

export const UpdateUserValidationSchema = userValidationSchema.pick({
  'name': true,
  'email' : true,
}).partial() satisfies ZodType <UpdateUserDto> 