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
		res.json(product);
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
		res.json(products);
	} catch (error) {
		res.status(500).json({ message: 'Error retrieving products' });
	}
};

export const createProduct = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { productId, name, price, rating, stockQuantity } = req.body;
		const product = await productService.createProduct(
			productId,
			name,
			price,
			rating,
			stockQuantity,
		);
		res.status(201).json(product);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};
