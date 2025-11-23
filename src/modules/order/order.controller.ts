import { Controller, Get, Post, Body, Param, Req, Query, ParseIntPipe ,Patch} from '@nestjs/common';
import { OrderService } from './order.service';
import { Roles } from 'src/decorators/roles.decorator';
import type {
  CreateOrderDTO,
  CreateOrderResponseDTO,
  CreateOrderReturnDTO,
  OrderOverviewResponseDTO,
  OrderResponseDTO,
} from './types/order.dto';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import {
  createOrderDTOValidationSchema,
  createReturnDTOValidationSchema,
} from './util/order.validation.schema';
import { paginationSchema } from 'src/utils/api.util';
import type {
  PaginatedResult,
  PaginationQueryType,
} from 'src/types/util.types';
import { User } from 'src/decorators/user.decorator';
import { UserResponseDTO } from '../auth/dto/auth.dto';
import { OrderStatus, ReturnStatus } from 'generated/prisma';

@Controller('order')
@Roles(['CUSTOMER'])
export class OrderController {
  constructor(private readonly orderService: OrderService,
    private readonly ordersService : OrderService
  ) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createOrderDTOValidationSchema))
    createOrderDto: CreateOrderDTO,
    @User() user: UserResponseDTO['user'],
  ): Promise<CreateOrderResponseDTO> {
    return this.orderService.create(createOrderDto, BigInt(user.id));
  }

  @Get()
  findAll(
    @Req() request: Express.Request,
    @Query(new ZodValidationPipe(paginationSchema))
    query: PaginationQueryType,
  ): Promise<PaginatedResult<OrderOverviewResponseDTO>> {
    return this.orderService.findAll(BigInt(request.user!.id), query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Express.Request,
  ): Promise<OrderResponseDTO> {
    return this.orderService.findOne(id, BigInt(request.user!.id));
  }
  
  // Update Order Status (Admin Only) 
  @Patch(':id/status')
  @Roles(['ADMIN'])
   updateStatus(
    @Param('id' , ParseIntPipe ) id: number,
    @Body() status : OrderStatus,
  ) {
    return this.ordersService.updateOrderStatus(+id, status);
  }
  // returns end points
  // create return
  @Post('return')
  createReturn(
    @Body(new ZodValidationPipe(createReturnDTOValidationSchema))
    createReturnDto: CreateOrderReturnDTO,
    @Req() request: Express.Request,
  ): Promise<OrderResponseDTO> {
    return this.orderService.createReturn(
      createReturnDto,
      BigInt(request.user!.id),
    );
  }
   // Update return Status (Admin Only) 
@Patch('returns/:id/status')
@Roles(['ADMIN'])
updateReturnStatus(
  @Param('id', ParseIntPipe) id: number,
  @Body() status: ReturnStatus,
) {
  return this.ordersService.updateReturnStatus(id,status);
}
}
