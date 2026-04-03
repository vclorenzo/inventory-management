import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as productService from '../services/product.service';

const prisma = new PrismaClient();

export const getProductById = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const product = await productService.getProductById(id);
		if (!product) {
			res.status(404).json({ message: 'Product not found' });
		} else {
			res.status(200).json({
				message: 'Product retrieved successfully',
				product,
			});
		}
	} catch (error) {
		res.status(500).json({ message: 'Error retrieving product' });
	}
};

export const getAllProducts = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const search = req.query.search?.toString();
		const products = await productService.getAllProducts(search);
		res.status(200).json({
			message: 'Successfully retrieved products',
			user: products ?? [],
			count: products?.length ?? 0,
		});
	} catch (error) {
		res.status(500).json({ message: 'Error retrieving products' });
	}
};

export const createProduct = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { name, price, rating, stockQuantity } = req.body;
		const product = await productService.createProduct({
			name,
			price,
			rating,
			stockQuantity,
		});
		res.status(201).json(product);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

export const updateProduct = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const data = req.body;
		const updatedProduct = await productService.updateProduct(id, data);
		res.status(200).json(updatedProduct);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteProduct = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const deletedProduct = await productService.deleteProduct(id);
		res.status(200).json({
			message: `Product ${deletedProduct.name} deleted successfully`,
		});
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};
