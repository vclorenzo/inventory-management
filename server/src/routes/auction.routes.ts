import { Router } from 'express';
import {
	createAuction,
	getAuctionById,
	getAllAuctions,
	updateAuction,
	deleteAuction,
} from '../controllers/auction.controller';
import { authenticateToken } from '#middleware/auth.middleware.ts';
import { validate } from '#middleware/validate.middleware.ts';
import {
	createAuctionSchema,
	updateAuctionSchema,
} from '#validations/auctions.validation.ts';

const router = Router();

router.get('/:id', getAuctionById);
router.get('/', getAllAuctions);
router.post(
	'/',
	authenticateToken,
	validate(createAuctionSchema),
	createAuction,
);
router.put('/:id', validate(updateAuctionSchema), updateAuction);
router.delete('/:id', deleteAuction);

export default router;
