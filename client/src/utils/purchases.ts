import {
	PurchaseItem,
	PurchaseOrderGroup,
} from '@/types/pages/Checkout'

export const formatPurchasePrice = (
	amount: number,
	currency = '₱',
) => `${currency}${amount.toLocaleString('en-PH')}`

export const groupPurchasesByOrder = (
	purchases: PurchaseItem[],
): PurchaseOrderGroup[] => {
	const groups = new Map<string, PurchaseOrderGroup>()

	for (const purchase of purchases) {
		const orderKey = purchase.orderId ?? purchase.purchaseId
		const key = `${orderKey}:${purchase.seller.userId}`

		const existing = groups.get(key)
		if (existing) {
			existing.items.push(purchase)
			existing.orderTotal += purchase.totalCost
			existing.isReviewed =
				existing.isReviewed || purchase.isReviewed
			continue
		}

		groups.set(key, {
			key,
			orderId: purchase.orderId,
			seller: purchase.seller,
			timestamp: purchase.timestamp,
			items: [purchase],
			orderTotal: purchase.totalCost,
			isReviewed: purchase.isReviewed,
		})
	}

	return Array.from(groups.values())
}
