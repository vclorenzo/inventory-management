import { PrismaClient, Products } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllProducts = async (search?: string) => {
	try {
		return await prisma.products.findMany({
			where: {
				name: {
					contains: search,
				},
			},
		});
	} catch (error) {
		throw error;
	}
};

export const getProductById = async (id: string) => {
	try {
		return await prisma.products.findUnique({
			where: {
				productId: id,
			},
		});
	} catch (error) {
		throw error;
	}
};

export const createProduct = async (
	name: string,
	price: number,
	rating: number,
	stockQuantity: number,
) => {
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
			throw new Error('Product does not exist');
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
			throw new Error('Product does not exist');
		}
		return await prisma.products.delete({
			where: { productId: id },
		});
	} catch (error) {
		throw error;
	}
};
