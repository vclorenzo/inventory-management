import { ProductStatus } from "@prisma/client";
import { AppError } from "#error/AppError.ts";

export const PRODUCT_STATUS = ProductStatus;

export const MARKETPLACE_PRODUCT_STATUS = ProductStatus.Available;

const PRODUCT_STATUS_VALUES = new Set<string>(Object.values(ProductStatus));

export function isProductStatus(value: string): value is ProductStatus {
  return PRODUCT_STATUS_VALUES.has(value);
}

export function resolveProductStatus({
  status,
  stockQuantity,
}: {
  status?: string | null;
  stockQuantity: number;
}): ProductStatus {
  if (stockQuantity <= 0) {
    return ProductStatus.SoldOut;
  }

  const normalized = status?.trim() || ProductStatus.Available;

  if (!isProductStatus(normalized)) {
    throw new AppError("Invalid product status", 400);
  }

  if (normalized === ProductStatus.SoldOut) {
    return ProductStatus.Available;
  }

  if (normalized === ProductStatus.Reserved && stockQuantity !== 1) {
    return ProductStatus.Available;
  }

  return normalized;
}

export function isPurchasableProductStatus(status: string): boolean {
  return (
    status === ProductStatus.Available || status === ProductStatus.Reserved
  );
}
