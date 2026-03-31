import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProductById = (id: string) =>
	prisma.products.findUnique({
		where: {
			productId: id,
		},
	});

export const getAllProducts = (search?: string) =>
	prisma.products.findMany({
		where: {
			name: {
				contains: search,
			},
		},
	});

export const createProduct = (
	productId: string,
	name: string,
	price: number,
	rating: number,
	stockQuantity: number,
) =>
	prisma.products.create({
		data: {
			productId,
			name,
			price,
			rating,
			stockQuantity,
		},
	});
