import {
	NotificationCollection,
	NotificationItem,
} from '@/types/pages/Notifications'
import { api } from '../api'

const emptyNotifications: NotificationCollection = {
	notifications: [],
	unreadCount: 0,
}

export const notificationsApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getNotifications: builder.query<NotificationCollection, void>({
			query: () => '/notifications',
			transformResponse: (response: {
				data?: NotificationCollection
			}) => response?.data ?? emptyNotifications,
			providesTags: ['Notifications'],
		}),
		markNotificationRead: builder.mutation<NotificationItem, string>({
			query: (notificationId) => ({
				url: `/notifications/${notificationId}/read`,
				method: 'PATCH',
			}),
			transformResponse: (response: { data?: NotificationItem }) =>
				response.data as NotificationItem,
			invalidatesTags: ['Notifications'],
		}),
		markAllNotificationsRead: builder.mutation<
			NotificationCollection,
			void
		>({
			query: () => ({
				url: '/notifications/read-all',
				method: 'PATCH',
			}),
			transformResponse: (response: {
				data?: NotificationCollection
			}) => response?.data ?? emptyNotifications,
			invalidatesTags: ['Notifications'],
		}),
	}),
})

export const {
	useGetNotificationsQuery,
	useMarkNotificationReadMutation,
	useMarkAllNotificationsReadMutation,
} = notificationsApi
