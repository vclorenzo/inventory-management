import { Router } from 'express';
import {
	createAuction,
	getAuctionById,
	getAllAuctions,
	updateAuction,
	deleteAuction,
} from '../controllers/auction.controller';
import { authenticateToken } from '#middleware/auth.middleware.ts';

const router = Router();

router.get('/:id', getAuctionById);
router.get('/', getAllAuctions);
router.post('/', authenticateToken, createAuction);
router.put('/:id', updateAuction);
router.delete('/:id', deleteAuction);

export default router;
