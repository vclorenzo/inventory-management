import {
	useAddBidMutation,
	useGetBidsQuery,
	useRemoveBidMutation,
	useUpdateBidMutation,
} from '@/state/internal/bidsApi'

export const useBids = () => {
	const query = useGetBidsQuery()
	const [addBid, addBidState] = useAddBidMutation()
	const [updateBid, updateBidState] = useUpdateBidMutation()
	const [removeBid, removeBidState] = useRemoveBidMutation()

	return {
		bidGroups: query.data ?? [],
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
		addBid,
		addBidState,
		updateBid,
		updateBidState,
		removeBid,
		removeBidState,
	}
}
