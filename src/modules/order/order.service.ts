import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateOrderDTO,
  CreateOrderReturnDTO,
  OrderOverviewResponseDTO,
} from './types/order.dto';
import { DatabaseService } from '../database/database.service';
import { MoneyUtil } from 'src/utils/money.util';
import { OrderStatus, Prisma, Product, ReturnStatus } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { PaginatedResult, PaginationQueryType } from 'src/types/util.types';
import { removeFields } from 'src/utils/object.util';
import { calculateRefundAmount } from './util/refund-calculator';

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: DatabaseService) {}

  async create(createOrderDto: CreateOrderDTO, userId: number | bigint) {
    // MISSING order total
    // missing product price
    const productIds = createOrderDto.map((item) => item.productId);
    // get products
    const products = await this.prismaService.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isDeleted: false,
      },
    });
    // validate all products exist like dto product ids
    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products are invalid');
    }

    const orderProductsData = this.mapProductDtoToOrderProducts(
      createOrderDto,
      products,
    );

    const orderTotalPrice = MoneyUtil.calculateTotalAmount(
      orderProductsData.map((orderPrdouct) => ({
        price: orderPrdouct.pricePerItem as Decimal,
        quantity: orderPrdouct.totalQty,
      })),
    );

    // create order included created data (transaction , product)
    const createdOrder = await this.prismaService.order.create({
      data: {
        orderProducts: {
          createMany: { data: orderProductsData },
        },
        transactions: {
          create: { amount: orderTotalPrice, type: 'DEBIT', userId },
        },
        userId: BigInt(userId),
        orderStatus: 'PENDING',
      },
      include: {
        orderProducts: { include: { product: true } },
        transactions: true,
        orderReturns: {
          include: { returnedItems: { include: { product: true } } },
        },
      },
    });

    return createdOrder;
  }

  findAll(
    userId: bigint,
    query: PaginationQueryType,
  ): Promise<PaginatedResult<OrderOverviewResponseDTO>> {
    return this.prismaService.$transaction(async (prisma) => {
      const pagination = this.prismaService.handleQueryPagination(query);

      const orders = await prisma.order.findMany({
        ...removeFields(pagination, ['page']),
        orderBy: { createdAt: 'desc' },
        where: { userId },
        include: {
          orderProducts: true,
          orderReturns: true,
          transactions: true,
        },
      });

      const count = await prisma.order.count();
      return {
        data: orders,
        ...this.prismaService.formatPaginationResponse({
          page: pagination.page,
          count,
          limit: pagination.take,
        }),
      };
    });
  }

  findOne(id: number, userId: bigint) {
    return this.prismaService.order.findUniqueOrThrow({
      where: { id, userId },
      include: {
        orderProducts: { include: { product: true } },
        transactions: true,
        orderReturns: {
          include: { returnedItems: { include: { product: true } } },
        },
      },
    });
  }

  // update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return `This action updates a #${id} order`;
  // }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  // helper methods

  private mapProductDtoToOrderProducts(
    createOrderDTO: CreateOrderDTO,
    products: Product[],
  ): Prisma.OrderProductCreateManyOrderInput[] {
    return createOrderDTO.map((item) => {
      const product = products.find(
        (p) => BigInt(p.id) === BigInt(item.productId),
      )!;
      return {
        productId: product.id,
        totalQty: item.qty,
        pricePerItem: product.price,
      };
    });
  }

  // returns logic
 async createReturn(createReturnDto: CreateOrderReturnDTO, userId: bigint) {
  const returnedProductsIdsInDTO = createReturnDto.items.map(item => item.productId);
  return this.prismaService.$transaction(async (tx) => {
    // 1- Ensure the order belongs to the same user
    await tx.order.findUniqueOrThrow({
      where: {
        id: createReturnDto.orderId,
        userId,
      },
    });
    // 2- Fetch the order products that match the returned product IDs
    const existingOrderProducts = await tx.orderProduct.findMany({
      where: {
        orderId: createReturnDto.orderId,
        productId: { in: returnedProductsIdsInDTO },
      },
    });
    // Validate that all returned products actually exist in the order
    if (existingOrderProducts.length !== returnedProductsIdsInDTO.length) {
      throw new BadRequestException('Invalid return products.');
    }
    // 3- Validate returned quantity for each product
    for (const item of createReturnDto.items) {
      const original = existingOrderProducts.find(p => Number(p.productId) === item.productId)!;
      // Quantity must be positive
      if (item.qty <= 0) {
        throw new BadRequestException(`Invalid qty for product ${item.productId}.`);
      }
      // Return qty cannot exceed purchased qty
      if (item.qty > original.totalQty) {
        throw new BadRequestException(
          `Return qty for product ${item.productId} exceeds purchased quantity.`
        );
      }
    }
    // 4- Create the orderReturn record along with returnedItems
    await tx.orderReturn.create({
      data: {
        orderId: BigInt(createReturnDto.orderId),
        returnedItems: {
          createMany: { data: createReturnDto.items },
        },
      },
    });
    // 5- Decrease the totalQty in orderProduct for each returned item
    for (const item of createReturnDto.items) {
      await tx.orderProduct.update({
        where: {
          orderId_productId: {
            orderId: createReturnDto.orderId,
            productId: item.productId,
          },
        },
        data: {
          totalQty: { decrement: item.qty },
        },
      });
    }
    // 6- Return the updated order details
    return this.findOne(createReturnDto.orderId, userId);
  });
}
 updateReturnStatus(returnId: number, status: ReturnStatus) {
  return this.prismaService.$transaction(async (tx) => {
    // 1. fetch orderReturn with order
    const orderReturn = await tx.orderReturn.findUnique({
      where: { id: returnId },
      include: { order: true, returnedItems: true },
    });

    if (!orderReturn) throw new NotFoundException("Return not found");

    // 2. update status
    const updatedReturn = await tx.orderReturn.update({
      where: { id: returnId },
      data: { status },
    });

    // if rejected, stop here
    if (status !== "REFUND") return updatedReturn;

    const orderProducts = await tx.orderProduct.findMany({
      where: { orderId: orderReturn.orderId },
    });

    const total = calculateRefundAmount( orderProducts, orderReturn.returnedItems )
    // 3. create a transaction record
    await tx.userTransaction.create({
  data: {
    amount: total,      
    userId: orderReturn.order.userId,         
    type: 'CREDIT',                           
    orderId: orderReturn.orderId,             
    orderReturnId: orderReturn.id,            
  },
});
   // 4. refund stock to products
    for (const item of orderReturn.returnedItems) {
      await tx.product.update({
        where: { id: item.productId },  
        data: { stock: { increment: item.qty } },
      });
    }

    return updatedReturn;
  });
}

updateOrderStatus(id: number, orderStatus: OrderStatus) {
  return this.prismaService.order.update({
    where: { id },
    data: {orderStatus},
  });
}
}