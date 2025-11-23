
export function calculateRefundAmount(
  orderProducts: { productId: bigint; pricePerItem: any }[],
  returnedItems: { productId: bigint; qty: number }[],
): number {
  let total = 0;

  for (const returned of returnedItems) {
    const matchedProduct = orderProducts.find(
      (op) => op.productId === returned.productId,
    );

    if (matchedProduct) {
      // Convert Prisma Decimal to number before calculations
      const price = Number(matchedProduct.pricePerItem);
      total += price * returned.qty;
    }
  }

  return total;
}
