export type NotificationType =
	| 'OUTBID'
	| 'AUCTION_ENDED'
	| 'MARKETPLACE_SOLD_OUT'
	| 'MARKETPLACE_PRICE_DROP'

export type NotificationListingType = 'Auction' | 'Marketplace'

export interface NotificationItem {
	notificationId: string
	type: NotificationType
	listingType: NotificationListingType
	productId: string
	title: string
	message: string
	metadata: Record<string, unknown>
	readAt: string | null
	createdAt: string
}

export interface NotificationCollection {
	notifications: NotificationItem[]
	unreadCount: number
}
