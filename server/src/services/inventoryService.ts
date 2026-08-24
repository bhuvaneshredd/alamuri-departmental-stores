import prisma from '../config/prisma';

export const decrementStock = async (
  items: Array<{ productId: string; quantity: number }>,
  tx: any = prisma
) => {
  for (const item of items) {
    const product = await tx.product.findUnique({
      where: { id: item.productId },
      select: { id: true, name: true, stockQuantity: true },
    });

    if (!product) {
      throw new Error(`Product ${item.productId} not found during stock deduction.`);
    }

    if (product.stockQuantity < item.quantity) {
      throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}.`);
    }

    await tx.product.update({
      where: { id: item.productId },
      data: {
        stockQuantity: {
          decrement: item.quantity,
        },
      },
    });
  }
};

export const restoreStock = async (
  items: Array<{ productId: string | null; quantity: number }>,
  tx: any = prisma
) => {
  for (const item of items) {
    if (!item.productId) continue;
    await tx.product.update({
      where: { id: item.productId },
      data: {
        stockQuantity: {
          increment: item.quantity,
        },
      },
    });
  }
};
