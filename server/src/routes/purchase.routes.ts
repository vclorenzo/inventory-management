import {
	getPurchases,
	placeOrder,
} from '#controllers/purchase.controller.ts'
import { authenticateToken } from '#middleware/auth.middleware.ts'
import { validate } from '#middleware/validate.middleware.ts'
import { placeOrderSchema } from '#validations/purchase.validations.ts'
import { Router } from 'express'

const router = Router()

router.use(authenticateToken)

router.get('/', getPurchases)
router.post('/', validate(placeOrderSchema), placeOrder)

export default router