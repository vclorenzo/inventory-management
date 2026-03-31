import { Router } from 'express';
import { getExpensesByCategory } from '../controllers/expense.controller';

const router = Router();

router.get('/', getExpensesByCategory);

export default router;
