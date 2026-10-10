'use client'

import Header from '@/components/Header'
import NotificationListItem from '@/components/NotificationListItem'
import {
	useGetNotificationsQuery,
	useMarkAllNotificationsReadMutation,
	useMarkNotificationReadMutation,
} from '@/state/internal/notificationsApi'
import { CircularProgress } from '@mui/material'

function Notifications() {
	const { data, isLoading, isError } = useGetNotificationsQuery()
	const [markNotificationRead] = useMarkNotificationReadMutation()
	const [markAllNotificationsRead, markAllState] =
		useMarkAllNotificationsReadMutation()

	const notifications = data?.notifications ?? []
	const unreadCount = data?.unreadCount ?? 0

	if (isLoading) {
		return (
			<div className="mx-auto w-full max-w-3xl pb-10">
				<Header name="Notifications" />
				<div className="flex min-h-[240px] items-center justify-center">
					<CircularProgress />
				</div>
			</div>
		)
	}

	if (isError) {
		return (
			<div className="mx-auto w-full max-w-3xl pb-10">
				<Header name="Notifications" />
				<div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-800">
					We couldn&apos;t load your notifications. Please try again.
				</div>
			</div>
		)
	}

	return (
		<div className="mx-auto w-full max-w-3xl pb-10">
			<div className="flex items-center justify-between gap-4">
				<Header name="Notifications" />
				{unreadCount > 0 ? (
					<button
						type="button"
						onClick={() => {
							void markAllNotificationsRead()
						}}
						disabled={markAllState.isLoading}
						className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{markAllState.isLoading
							? 'Marking...'
							: 'Mark all as read'}
					</button>
				) : null}
			</div>

			{notifications.length === 0 ? (
				<div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-500">
					No notifications yet.
				</div>
			) : (
				<ul className="mt-6 flex flex-col gap-3">
					{notifications.map((notification) => {
						const isUnread = !notification.readAt
						return (
							<li key={notification.notificationId}>
								<NotificationListItem
									notification={notification}
									onSelect={() => {
										if (isUnread) {
											void markNotificationRead(
												notification.notificationId,
											)
										}
									}}
								/>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}

export default Notifications
