import { Router } from 'express';
import {
	createProduct,
	getProductById,
	getAllProducts,
	updateProduct,
	deleteProduct,
} from '../controllers/product.controller';
import { authenticateToken } from '#middleware/auth.middleware.ts';

const router = Router();

router.get('/:id', getProductById);
router.get('/', getAllProducts);
router.post('/', authenticateToken, createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
