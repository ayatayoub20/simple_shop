import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TransactionsService {
 constructor(private prisma: DatabaseService) {}

  // 1- Get transactions for current user
  getMyTransactions(userId: number | bigint) {
    return this.prisma.userTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // newest first
    });
  }

  // 2- Admin: get all transactions
  getAll() {
    return this.prisma.userTransaction.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
