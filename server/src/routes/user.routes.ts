import { Router } from 'express';
import {
	getAllUsers,
	getUserById,
	updateUser,
	deleteUser,
} from '../controllers/user.controller';
import { authenticateToken } from '#middleware/auth.middleware.ts';

const router = Router();

router.get('/', authenticateToken, getAllUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, deleteUser);

export default router;
