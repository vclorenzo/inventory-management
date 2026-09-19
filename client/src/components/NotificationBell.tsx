'use client'

import NotificationPopup from '@/components/NotificationPopup'
import { useNotificationUpdates } from '@/hooks/useNotificationUpdates'
import { useGetNotificationsQuery } from '@/state/internal/notificationsApi'
import { useAppSelector } from '@/state/redux'
import { NotificationItem } from '@/types/pages/Notifications'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useState } from 'react'

function NotificationBell() {
	const { data } = useGetNotificationsQuery()
	const isNotificationBubbleEnabled = useAppSelector(
		(state) => state.global.isNotificationBubbleEnabled !== false,
	)
	const [popupNotification, setPopupNotification] =
		useState<NotificationItem | null>(null)

	const handleDismissPopup = useCallback(() => {
		setPopupNotification(null)
	}, [])

	const handleNotification = useCallback(
		(incoming: NotificationItem) => {
			if (!isNotificationBubbleEnabled) return
			setPopupNotification(incoming)
		},
		[isNotificationBubbleEnabled],
	)

	useNotificationUpdates(true, handleNotification)

	const unreadCount = data?.unreadCount ?? 0
	const unreadLabel = unreadCount > 99 ? '99+' : String(unreadCount)

	return (
		<div className="relative">
			<Link
				href="/notifications"
				aria-label={
					unreadCount > 0
						? `Notifications, ${unreadCount} unread`
						: 'Notifications'
				}
			>
				<Bell className="cursor-pointer text-gray-500" size={24} />
				{unreadCount > 0 ? (
					<span className="absolute -right-2 -top-2 inline-flex min-w-[1.15rem] items-center justify-center rounded-full bg-red-400 px-[0.4rem] py-1 text-xs font-semibold leading-none text-red-100">
						{unreadLabel}
					</span>
				) : null}
			</Link>
			{isNotificationBubbleEnabled ? (
				<NotificationPopup
					notification={popupNotification}
					onDismiss={handleDismissPopup}
				/>
			) : null}
		</div>
	)
}

export default NotificationBell
