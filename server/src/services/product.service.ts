import { AppError } from '#error/AppError.ts';
import { PrismaClient, Products } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllProducts = async ({
	search,
	page = 1,
	limit = 10,
}: {
	search?: string;
	page?: number;
	limit?: number;
} = {}) => {
	try {
		const where = search ? { name: { contains: search } } : {};
		const [totalCount, products] = await prisma.$transaction([
			prisma.products.count({ where }),
			prisma.products.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
			}),
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
	price,
	rating,
	stockQuantity,
}: {
	name: string;
	price: number;
	rating: number;
	stockQuantity: number;
}) => {
	try {
		return await prisma.products.create({
			data: {
				name,
				price,
				rating,
				stockQuantity,
			},
		});
	} catch (error) {
		throw error;
	}
};

export const updateProduct = async (id: string, data: Partial<Products>) => {
	try {
		const existingProduct = await getProductById(id);
		if (!existingProduct) {
			throw new AppError('Product does not exist');
		}

		return await prisma.products.update({
			where: { productId: id },
			data: {
				name: data.name,
				price: data.price,
				rating: data.rating,
				stockQuantity: data.stockQuantity,
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
			throw new AppError('Product does not exist');
		}
		return await prisma.products.delete({
			where: { productId: id },
		});
	} catch (error) {
		throw error;
	}
};
