import { Router } from 'express';
import {
	createProduct,
	getProductById,
	getAllProducts,
} from '../controllers/product.controller';

const router = Router();

router.get('/:id', getProductById);
router.get('/', getAllProducts);
router.post('/', createProduct);

export default router;
