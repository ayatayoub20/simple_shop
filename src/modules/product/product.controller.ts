import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, Req, ParseIntPipe, UseFilters, ImATeapotException } from '@nestjs/common';
import { ProductService } from './product.service';
import type { CreateProductDTO, UpdateProductDTO } from './dto/product.dto';
import type { ProductQuery } from './types/product.types';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductResponseDTO } from './types/product.dto';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { productQuerySchema, productValidationSchema, updateProductValidationSchema } from './util/proudct.validation.schema';
import { ImageKitExceptionFilter } from 'src/exceptions/exception';
import { FileCleanupInterceptor } from '../file/cleanup-file.interceptor';


@Controller('product')
export class ProductController {
  constructor(private readonly ProductService: ProductService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'), FileCleanupInterceptor)
  @UseFilters(ImageKitExceptionFilter)
  create(
    @Body(new ZodValidationPipe(productValidationSchema))
    createProductDto: CreateProductDTO,
    @Req() request: Express.Request,
    @UploadedFile()
    file?: Express.Multer.File,
  ): Promise<ProductResponseDTO> {
    return this.ProductService.create(createProductDto, request.user,file);
  }

  @Get()
  findAll( @Query(new ZodValidationPipe(productQuerySchema)) query: ProductQuery) {
    return this.ProductService.findAll({
      limit : Number(query.limit),
      page: Number(query.page),
      name: query.name,
    });
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.ProductService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'),FileCleanupInterceptor)
  @UseFilters(ImageKitExceptionFilter)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateProductValidationSchema))
    updatePayload: UpdateProductDTO,
    @Req()
    request: Express.Request,
    @UploadedFile()
    file?: Express.Multer.File,
  ): Promise<ProductResponseDTO> {
    return this.ProductService.update(id, updatePayload, request.user, file);
  }
 

   @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Express.Request,
  ) {
    return this.ProductService.remove(id, request.user);
  }
}

