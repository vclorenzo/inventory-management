import { AppError } from '#error/AppError.ts'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

const SHIPPING_FEE = 50

const DEFAULT_PRODUCT_IMAGE =
	'https://s3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com/product1.png'

const cartItemInclude = {
	product: {
		include: {
			owner: {
				select: {
					userId: true,
					name: true,
				},
			},
		},
	},
} as const

export type PlaceOrderParams = {
	userId: string
	cartItemIds: string[]
	addressId: string
	paymentMethod: string
}

export type PlaceOrderItem = {
	productId: string
	productName: string
	quantity: number
	unitPrice: number
	totalAmount: number
	saleId: string
	purchaseId: string
}

export type PlaceOrderResult = {
	orderId: string
	paymentMethod: string
	addressId: string
	itemCount: number
	subtotal: number
	shippingFee: number
	total: number
	currency: string
	items: PlaceOrderItem[]
	placedAt: string
}

export type PurchaseItem = {
	purchaseId: string
	orderId: string | null
	productId: string
	productName: string
	image: string
	brand: string
	condition: string
	quantity: number
	unitCost: number
	totalCost: number
	timestamp: string
	isReviewed: boolean
	seller: {
		userId: string
		name: string
	}
}

const purchaseInclude = {
	product: {
		include: {
			owner: {
				select: {
					userId: true,
					name: true,
				},
			},
		},
	},
} as const

export const getPurchasesByUserId = async (
	userId: string,
): Promise<PurchaseItem[]> => {
	const purchases = await prisma.purchases.findMany({
		where: { userId },
		include: purchaseInclude,
		orderBy: { timestamp: 'desc' },
	})

	const orderIds = [
		...new Set(
			purchases
				.map((purchase) => purchase.orderId)
				.filter((orderId): orderId is string => Boolean(orderId)),
		),
	]

	const reviewedOrders =
		orderIds.length === 0
			? []
			: await prisma.reviews.findMany({
					where: {
						reviewerId: userId,
						orderId: { in: orderIds },
					},
					select: {
						orderId: true,
						userId: true,
					},
				})

	const reviewedKeys = new Set(
		reviewedOrders.map(
			(review) => `${review.orderId}:${review.userId}`,
		),
	)

	return purchases.map((purchase) => {
		const sellerId = purchase.product.owner.userId
		const isReviewed = purchase.orderId
			? reviewedKeys.has(`${purchase.orderId}:${sellerId}`)
			: false

		return {
			purchaseId: purchase.purchaseId,
			orderId: purchase.orderId,
			productId: purchase.productId,
			productName: purchase.product.name,
			image: DEFAULT_PRODUCT_IMAGE,
			brand: purchase.product.brand,
			condition: purchase.product.condition,
			quantity: purchase.quantity,
			unitCost: purchase.unitCost,
			totalCost: purchase.totalCost,
			timestamp: purchase.timestamp.toISOString(),
			isReviewed,
			seller: {
				userId: sellerId,
				name: purchase.product.owner.name,
			},
		}
	})
}

export const placeOrder = async ({
	userId,
	cartItemIds,
	addressId,
	paymentMethod,
}: PlaceOrderParams): Promise<PlaceOrderResult> => {
	const uniqueCartItemIds = [...new Set(cartItemIds)]

	const address = await prisma.address.findFirst({
		where: {
			addressId,
			profile: { userId },
		},
		select: { addressId: true },
	})

	if (!address) {
		throw new AppError('Delivery address not found', 404)
	}

	const cartItems = await prisma.cartItems.findMany({
		where: {
			userId,
			cartItemId: { in: uniqueCartItemIds },
		},
		include: cartItemInclude,
	})

	if (cartItems.length !== uniqueCartItemIds.length) {
		throw new AppError(
			'One or more cart items were not found in your cart',
			404,
		)
	}

	for (const item of cartItems) {
		if (item.product.userId === userId) {
			throw new AppError(
				`You cannot purchase your own product: ${item.product.name}`,
				400,
			)
		}

		if (item.product.stockQuantity < item.quantity) {
			throw new AppError(
				`Insufficient stock for "${item.product.name}". Available: ${item.product.stockQuantity}`,
				400,
			)
		}

		if (item.product.stockQuantity <= 0) {
			throw new AppError(
				`"${item.product.name}" is out of stock`,
				400,
			)
		}
	}

	const orderId = randomUUID()
	const placedAt = new Date()

	const result = await prisma.$transaction(async (tx) => {
		const items: PlaceOrderItem[] = []

		for (const item of cartItems) {
			const { product, quantity } = item
			const unitPrice = product.price
			const totalAmount = unitPrice * quantity

			const updated = await tx.products.updateMany({
				where: {
					productId: product.productId,
					stockQuantity: { gte: quantity },
				},
				data: {
					stockQuantity: { decrement: quantity },
				},
			})

			if (updated.count === 0) {
				throw new AppError(
					`Insufficient stock for "${product.name}"`,
					400,
				)
			}

			const refreshed = await tx.products.findUnique({
				where: { productId: product.productId },
				select: { stockQuantity: true },
			})

			if (refreshed && refreshed.stockQuantity <= 0) {
				await tx.products.update({
					where: { productId: product.productId },
					data: { status: 'Unavailable' },
				})
			}

			const saleId = randomUUID()
			const purchaseId = randomUUID()

			await tx.sales.create({
				data: {
					saleId,
					productId: product.productId,
					timestamp: placedAt,
					quantity,
					unitPrice,
					totalAmount,
				},
			})

			await tx.purchases.create({
				data: {
					purchaseId,
					productId: product.productId,
					userId,
					orderId,
					timestamp: placedAt,
					quantity,
					unitCost: unitPrice,
					totalCost: totalAmount,
				},
			})

			items.push({
				productId: product.productId,
				productName: product.name,
				quantity,
				unitPrice,
				totalAmount,
				saleId,
				purchaseId,
			})
		}

		await tx.cartItems.deleteMany({
			where: {
				userId,
				cartItemId: { in: uniqueCartItemIds },
			},
		})

		const subtotal = items.reduce((sum, row) => sum + row.totalAmount, 0)
		const itemCount = items.reduce((sum, row) => sum + row.quantity, 0)
		const currency = cartItems[0]?.currency ?? '₱'

		return {
			orderId,
			paymentMethod,
			addressId,
			itemCount,
			subtotal,
			shippingFee: SHIPPING_FEE,
			total: subtotal + SHIPPING_FEE,
			currency,
			items,
			placedAt: placedAt.toISOString(),
		} satisfies PlaceOrderResult
	})

	return result
}
