import { Injectable } from '@nestjs/common';
import { ProductQuery } from './types/product.types';
import { DatabaseService } from '../database/database.service';
import { Prisma } from 'generated/prisma';
import { CreateProductDTO, UpdateProductDTO } from './dto/product.dto';
import { FileService } from '../file/file.service';
import { SideEffectQueue } from 'src/utils/side-effects';
import { removeFields } from 'src/utils/object.util';


@Injectable()
export class ProductService {
  prisma: any;
  constructor( private readonly prismaService : DatabaseService,
    private readonly fileService : FileService
  ) {}
create(
    createProductDto: CreateProductDTO,
    user: Express.Request['user'],
    file?: Express.Multer.File,

  ) {
    const dataPayload: Prisma.ProductUncheckedCreateInput = {
  ...createProductDto,
  merchantId: Number(user!.id),
};

if (file) {
  dataPayload.Asset = {
   create: this.fileService.createFileAssetData(file, Number(user!.id)),

  };
}

return this.prismaService.product.create({
  data: dataPayload,
  include: { Asset: true },
});

  }
findAll(query: ProductQuery) {
  return this.prismaService.$transaction(async (prisma) => {
    // Build dynamic search condition:
    // If the user provides a "name" in the query, filter by name (partial match using "contains")
    // Otherwise, apply no filter.
    const whereClause: Prisma.ProductWhereInput = query.name
      ? { name: { contains: query.name } }
      : {};

    // Handle pagination: extract page, skip, take from the query
    const pagination = this.prismaService.handleQueryPagination(query);

    // Fetch paginated products based on filters and pagination values
    const products = await prisma.product.findMany({
      // Spread pagination properties except "page" since Prisma doesn't use it
      ...removeFields(pagination, ['page']),
      where: whereClause,
      orderBy: { id: 'desc' },        // sorting by newest
      select: {                       // important fields only
        id: true,
        name: true,
        price: true,
        stock: true,
      },

    });

    // Count total number of products that match the filter (without pagination)
    const count = await prisma.product.count({
      where: whereClause,
    });

    // Return formatted paginated response including:
    // - data
    // - page number
    // - total items count
    // - total pages, limit, etc.
    const meta = this.prismaService.formatPaginationResponse({
      page: pagination.page,
      count,
      limit: pagination.take,
    });
    return {
      data: products,
      ...meta,
    };
  });
}


  findOne(id: number) {
    return this.prismaService.product.findUnique({
      where: { id },
      include: { Asset: true },
    });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDTO,
    user: Express.Request['user'],
    file?: Express.Multer.File,
  ) {
    // get instance side effects queue
    const sideEffects = new SideEffectQueue();

    // run prisma transaction { invoke fileservice.deleteFile (prismaTX,productId,user,sideEffect) , prisma update product  }
    const updatedProduct = await this.prismaService.$transaction(
      async (prismaTX) => {
        if (file) {
          await this.fileService.deleteProductAsset(
            prismaTX,
            id,
            Number(user!.id),
            sideEffects,
          );
        }

        const dataPayload: Prisma.ProductUncheckedUpdateInput = {
          ...updateProductDto,
        };
        if (file) {
          dataPayload.Asset = {
            create: this.fileService.createFileAssetData(
              file,
              Number(user!.id),
            ),
          };
        }
        // order is important here
        return await prismaTX.product.update({
          where: { id, merchantId: Number(user!.id) },
          data: dataPayload,
          include: { Asset: true },
        });
      },
    );

    await sideEffects.runAll();
    return updatedProduct;
  }

   remove(id: number, user: Express.Request['user']) {
    return this.prismaService.product.update({
      where: { id, merchantId: Number(user!.id) },
      data: { isDeleted: true },
    });
  }
}