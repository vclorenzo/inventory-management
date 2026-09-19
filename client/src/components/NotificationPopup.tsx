'use client'

import NotificationListItem from '@/components/NotificationListItem'
import { useMarkNotificationReadMutation } from '@/state/internal/notificationsApi'
import { NotificationItem } from '@/types/pages/Notifications'
import { X } from 'lucide-react'
import { useEffect } from 'react'

const POPUP_DURATION_MS = 5000

type NotificationPopupProps = {
	notification: NotificationItem | null
	onDismiss: () => void
}

function NotificationPopup({
	notification,
	onDismiss,
}: NotificationPopupProps) {
	const [markNotificationRead] = useMarkNotificationReadMutation()

	useEffect(() => {
		if (!notification) return

		const timeout = window.setTimeout(() => {
			onDismiss()
		}, POPUP_DURATION_MS)

		return () => window.clearTimeout(timeout)
	}, [notification, onDismiss])

	if (!notification) return null

	return (
		<div
			role="status"
			aria-live="polite"
			className="absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
		>
			<button
				type="button"
				aria-label="Dismiss notification"
				onClick={onDismiss}
				className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
			>
				<X size={16} />
			</button>
			<NotificationListItem
				isPopup={true}
				notification={notification}
				variant="menu"
				onSelect={() => {
					onDismiss()
					if (!notification.readAt) {
						void markNotificationRead(notification.notificationId)
					}
				}}
			/>
		</div>
	)
}

export default NotificationPopup
