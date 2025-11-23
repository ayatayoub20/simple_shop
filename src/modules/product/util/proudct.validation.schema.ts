import z, { ZodType } from 'zod';
import { CreateProductDTO } from '../dto/product.dto';
import { ProductQuery } from '../types/product.types';
import { paginationSchema } from 'src/utils/api.util';


export const productValidationSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().min(2).max(255),
  price: z.coerce.number().min(0),
}) satisfies ZodType<CreateProductDTO>;

export const updateProductValidationSchema =
  productValidationSchema.partial() satisfies ZodType<
    Partial<CreateProductDTO>
  >;


  export const productQuerySchema = paginationSchema.extend({
    name: z.string().min(2).max(255).optional(),
  }) satisfies ZodType<ProductQuery>;
