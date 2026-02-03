import { Router } from 'express';
import {
	createProduct,
	getProduct,
	getProducts,
} from '../controllers/productController';

const router = Router();

router.get('/:id', getProduct);
router.get('/', getProducts);
router.post('/', createProduct);

export default router;
