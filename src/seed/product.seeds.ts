import { Product } from 'generated/prisma';
import { faker } from '@faker-js/faker';
export const generateProductSeed = (merchantId: bigint) => {
  const seededProduct: Omit<
    Product,
    'id' | 'createdAt' | 'updatedAt' | 'price' | 'isDeleted' 
  > & { price: number } = {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.number.int({ min: 100, max: 10000 }),
    stock: faker.number.int(),
    merchantId,
  };
  return seededProduct;
};