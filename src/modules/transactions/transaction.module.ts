import { Module } from '@nestjs/common';
import { TransactionsService } from './transaction.service';
import { TransactionsController } from './transaction.controller';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService , DatabaseService],
})
export class TransactionsModule {}
