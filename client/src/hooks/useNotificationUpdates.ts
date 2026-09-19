'use client'

import { SOCKET_EVENTS } from '@/constants/socket'
import { getSocket } from '@/lib/socket'
import { notificationsApi } from '@/state/internal/notificationsApi'
import { useAppDispatch } from '@/state/redux'
import {
	NotificationItem,
	NotificationListingType,
	NotificationType,
} from '@/types/pages/Notifications'
import { useEffect, useRef } from 'react'

const NOTIFICATION_TYPES: NotificationType[] = [
	'OUTBID',
	'AUCTION_ENDED',
	'MARKETPLACE_SOLD_OUT',
	'MARKETPLACE_PRICE_DROP',
]

function isNotificationType(value: unknown): value is NotificationType {
	return (
		typeof value === 'string' &&
		NOTIFICATION_TYPES.includes(value as NotificationType)
	)
}

function listingTypeFromNotification(
	type: NotificationType,
	listingType: unknown,
): NotificationListingType {
	if (listingType === 'Marketplace' || listingType === 'Auction') {
		return listingType
	}
	if (
		type === 'MARKETPLACE_SOLD_OUT' ||
		type === 'MARKETPLACE_PRICE_DROP'
	) {
		return 'Marketplace'
	}
	return 'Auction'
}

function parseNotification(value: unknown): NotificationItem | null {
	if (!value || typeof value !== 'object') return null

	const payload = value as Record<string, unknown>
	const {
		notificationId,
		type,
		listingType,
		productId,
		title,
		message,
		metadata,
		readAt,
		createdAt,
	} = payload

	if (typeof notificationId !== 'string' || notificationId.length === 0) {
		return null
	}
	if (!isNotificationType(type)) {
		return null
	}
	if (typeof productId !== 'string' || productId.length === 0) {
		return null
	}
	if (typeof title !== 'string' || typeof message !== 'string') {
		return null
	}
	if (typeof createdAt !== 'string') {
		return null
	}
	if (readAt !== null && typeof readAt !== 'string') {
		return null
	}

	return {
		notificationId,
		type,
		listingType: listingTypeFromNotification(type, listingType),
		productId,
		title,
		message,
		metadata:
			metadata && typeof metadata === 'object' && !Array.isArray(metadata)
				? (metadata as Record<string, unknown>)
				: {},
		readAt: typeof readAt === 'string' ? readAt : null,
		createdAt,
	}
}

export function useNotificationUpdates(
	isEnabled: boolean,
	onNotification?: (notification: NotificationItem) => void,
) {
	const dispatch = useAppDispatch()
	const onNotificationRef = useRef(onNotification)

	useEffect(() => {
		onNotificationRef.current = onNotification
	}, [onNotification])

	useEffect(() => {
		if (!isEnabled) return

		const socket = getSocket()
		if (!socket) return

		const handleNotification = (value: unknown) => {
			const payload = parseNotification(value)
			if (!payload) return

			onNotificationRef.current?.(payload)

			dispatch(
				notificationsApi.util.updateQueryData(
					'getNotifications',
					undefined,
					(draft) => {
						const alreadyExists = draft.notifications.some(
							(item) =>
								item.notificationId === payload.notificationId,
						)
						if (alreadyExists) return

						draft.notifications.unshift(payload)
						if (!payload.readAt) {
							draft.unreadCount += 1
						}
					},
				),
			)
		}

		socket.on(SOCKET_EVENTS.NOTIFICATION_CREATED, handleNotification)

		if (!socket.connected) {
			socket.connect()
		}

		return () => {
			socket.off(SOCKET_EVENTS.NOTIFICATION_CREATED, handleNotification)
		}
	}, [dispatch, isEnabled])
}
