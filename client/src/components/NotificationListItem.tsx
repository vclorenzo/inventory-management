'use client'

import { NotificationItem } from '@/types/pages/Notifications'
import { formatEndedAt } from '@/utils/dateFormatter'
import { getProductImageUrl } from '@/utils/productImage'
import { Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const IMAGE_SIZE = 72

export function getNotificationHref(notification: NotificationItem) {
	return notification.listingType === 'Marketplace'
		? `/marketplace/${notification.productId}`
		: `/auctions/${notification.productId}`
}

type NotificationListItemProps = {
	notification: NotificationItem
	onSelect?: () => void
	variant?: 'page' | 'menu'
	isPopup?: boolean
}

function NotificationListItem({
	notification,
	onSelect,
	variant = 'page',
	isPopup = false,
}: NotificationListItemProps) {
	const [hasImageError, setHasImageError] = useState(false)

	useEffect(() => {
		setHasImageError(false)
	}, [notification.productId])
	const isUnread = !notification.readAt
	const href = getNotificationHref(notification)
	const className =
		variant === 'menu'
			? `flex gap-3 px-3 py-3 transition-colors hover:bg-gray-50 ${
					isUnread ? 'bg-blue-50' : 'bg-white'
				}`
			: `flex gap-3 rounded-xl border p-4 shadow-sm transition-colors hover:border-gray-300 ${
					isUnread ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
				}`

	return (
		<Link href={href} onClick={onSelect} className={className}>
			{hasImageError ? (
				<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
					<Package size={24} aria-hidden />
				</div>
			) : (
				<Image
					src={getProductImageUrl(notification.productId)}
					alt={notification.title}
					width={IMAGE_SIZE}
					height={IMAGE_SIZE}
					onError={() => setHasImageError(true)}
					className="h-14 w-14 shrink-0 rounded-lg object-cover"
				/>
			)}
			<div className="min-w-0 flex-1">
				<div className="flex items-start justify-between gap-3">
					<p className="font-semibold text-gray-900">{notification.title}</p>
					{isUnread && !isPopup ? (
						<span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
					) : null}
				</div>
				<p className="mt-1 text-sm text-gray-700">{notification.message}</p>
				<p className="mt-2 text-xs text-gray-500">
					{formatEndedAt(notification.createdAt)}
				</p>
			</div>
		</Link>
	)
}

export default NotificationListItem
