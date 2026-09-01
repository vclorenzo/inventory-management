import {
	useAddBidMutation,
	useGetBidsQuery,
	useRemoveBidMutation,
	useUpdateBidMutation,
} from '@/state/internal/bidsApi'
import { BidGroup, BidItem, CompletedBidEntry } from '@/types/pages/Bids'
import { useMemo } from 'react'

const isActiveBid = (item: BidItem) => item.isAuctionOpen === true

const isCompletedBid = (item: BidItem) => !isActiveBid(item)

export const flattenCompletedBids = (
	groups: BidGroup[],
): CompletedBidEntry[] =>
	groups
		.flatMap((group) =>
			group.items
				.filter(isCompletedBid)
				.map((item) => ({ shop: group.shop, item })),
		)
		.sort((a, b) => {
			const aEnded = a.item.endedAt
				? new Date(a.item.endedAt).getTime()
				: 0
			const bEnded = b.item.endedAt
				? new Date(b.item.endedAt).getTime()
				: 0
			return bEnded - aEnded
		})

export const filterActiveBidGroups = (groups: BidGroup[]): BidGroup[] =>
	groups
		.map((group) => ({
			...group,
			items: group.items.filter(isActiveBid),
		}))
		.filter((group) => group.items.length > 0)

export const useBids = () => {
	const query = useGetBidsQuery()
	const [addBid, addBidState] = useAddBidMutation()
	const [updateBid, updateBidState] = useUpdateBidMutation()
	const [removeBid, removeBidState] = useRemoveBidMutation()

	const bidGroups = query.data ?? []
	const completedBids = useMemo(
		() => flattenCompletedBids(bidGroups),
		[bidGroups],
	)
	const activeBidGroups = useMemo(
		() => filterActiveBidGroups(bidGroups),
		[bidGroups],
	)

	return {
		bidGroups,
		activeBidGroups,
		completedBids,
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
