import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { TransactionsService } from './transaction.service';
import { Roles } from 'src/decorators/roles.decorator';


@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // 1- Get my transactions (logged-in user)
  @Get('my')
  getMyTransactions(
    @Req() request: Express.Request,
  ) {
    return this.transactionsService.getMyTransactions(BigInt(request.user!.id));
  }

  // 2- Admin: get all transactions
  @Get('all')
  @Roles(['ADMIN'])
  getAllTransactions() {
    return this.transactionsService.getAll();
  }
}