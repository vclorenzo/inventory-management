import { AppError } from "#error/AppError.ts";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllProducts = async ({
  search,
  page = 1,
  limit,
}: {
  search?: string;
  page?: number;
  limit?: number;
} = {}) => {
  try {
    const where = search ? { name: { contains: search } } : {};

    const [totalCount, products] = await prisma.$transaction([
      prisma.products.count({ where }),
      limit !== undefined
        ? prisma.products.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
          })
        : prisma.products.findMany({ where }),
    ]);
    return { products, totalCount };
  } catch (error) {
    throw error;
  }
};

export const getProductById = async (id: string) => {
  try {
    return await prisma.products.findFirst({
      where: {
        productId: id,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const createProduct = async ({
  name,
  productCategory,
  brand,
  condition,
  price,
  rating,
  stockQuantity,
  status,
  description,
  paymentMethods = [],
  meetupLocations = [],
  shippingDetails,
}: {
  name: string;
  productCategory: string;
  brand: string;
  condition: string;
  price: number;
  rating: number;
  stockQuantity: number;
  status: string;
  description: string;
  paymentMethods?: string[];
  meetupLocations?: string[];
  shippingDetails?: string | null;
}) => {
  try {
    return await prisma.products.create({
      data: {
        name,
        productCategory,
        brand,
        condition,
        price,
        rating,
        stockQuantity,
        status,
        description,
        paymentMethods,
        meetupLocations,
        shippingDetails,
      },
    });
  } catch (error) {
    throw error;
  }
};

type ProductUpdatePayload = {
  name?: string;
  price?: number;
  rating?: number | null;
  stockQuantity?: number;
  status?: string;
  paymentMethods?: string[];
  meetupLocations?: string[];
  shippingDetails?: string | null;
};

export const updateProduct = async (id: string, data: ProductUpdatePayload) => {
  try {
    const existingProduct = await getProductById(id);
    if (!existingProduct) {
      throw new AppError("Product does not exist");
    }

    return await prisma.products.update({
      where: { productId: id },
      data: {
        name: data.name,
        price: data.price,
        rating: data.rating,
        stockQuantity: data.stockQuantity,
        status: data.status,
        paymentMethods: data.paymentMethods,
        meetupLocations: data.meetupLocations,
        shippingDetails: data.shippingDetails,
      },
    });
  } catch (error) {
    throw error;
  }
};
export const deleteProduct = async (id: string) => {
  try {
    const existingProduct = await getProductById(id);
    if (!existingProduct) {
      throw new AppError("Product does not exist");
    }
    return await prisma.products.delete({
      where: { productId: id },
    });
  } catch (error) {
    throw error;
  }
};
