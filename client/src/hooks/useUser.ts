import { useGetUserByIdQuery } from '@/state/internal/usersApi'

export const useUser = (userId: string) => {
	const query = useGetUserByIdQuery(userId, { skip: !userId })

	return {
		user: query.data ?? null,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	}
}
