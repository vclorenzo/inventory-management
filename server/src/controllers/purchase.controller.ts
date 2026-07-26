import { AppError } from '#error/AppError.ts'
import * as purchaseService from '#services/purchase.service.ts'
import { Request, Response } from 'express'

const getUserId = (req: Request): string | undefined =>
	(req.user as { id?: string })?.id

export const getPurchases = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const userId = getUserId(req)
		if (!userId) {
			res.status(401).json({ message: 'Authentication required' })
			return
		}

		const purchases = await purchaseService.getPurchasesByUserId(userId)
		res.status(200).json({
			message: 'Purchases retrieved successfully',
			data: purchases,
		})
	} catch (error) {
		if (error instanceof AppError) {
			res.status(error.statusCode).json({ message: error.message })
			return
		}
		res.status(500).json({ message: 'Error retrieving purchases' })
	}
}

export const placeOrder = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const userId = getUserId(req)
		if (!userId) {
			res.status(401).json({ message: 'Authentication required' })
			return
		}

		const { cartItemIds, addressId, paymentMethod } = req.body

		const order = await purchaseService.placeOrder({
			userId,
			cartItemIds,
			addressId,
			paymentMethod,
		})

		res.status(201).json({
			message: 'Order placed successfully',
			data: order,
		})
	} catch (error) {
		if (error instanceof AppError) {
			res.status(error.statusCode).json({ message: error.message })
			return
		}
		res.status(500).json({ message: 'Error placing order' })
	}
}
