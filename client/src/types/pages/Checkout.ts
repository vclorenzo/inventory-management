export type CheckoutFormValues = {
	paymentMethod: string
}

export type PaymentMethodOption = {
	value: string
	label: string
	description: string
}

export type PlaceOrderRequest = {
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
	seller: {
		userId: string
		name: string
	}
}

export type PurchaseOrderGroup = {
	key: string
	orderId: string | null
	seller: {
		userId: string
		name: string
	}
	timestamp: string
	items: PurchaseItem[]
	orderTotal: number
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
