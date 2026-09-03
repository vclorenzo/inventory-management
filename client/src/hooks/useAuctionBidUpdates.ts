'use client'

import { SOCKET_EVENTS, AuctionBidUpdatePayload } from '@/constants/socket'
import { getSocket } from '@/lib/socket'
import { auctionsApi } from '@/state/internal/auctionsApi'
import { useAppDispatch, type RootState } from '@/state/redux'
import { useEffect, useState } from 'react'
import { useStore } from 'react-redux'

function isNewerRevision(
	incoming: number,
	current: number | undefined,
) {
	return incoming > (current ?? 0)
}

function parseAuctionBidUpdate(value: unknown): AuctionBidUpdatePayload | null {
	if (!value || typeof value !== 'object') return null

	const payload = value as Record<string, unknown>
	const { productId, bidCount, currentHighestBid, revision } = payload

	if (typeof productId !== 'string' || productId.length === 0) {
		return null
	}
	if (
		typeof bidCount !== 'number' ||
		!Number.isInteger(bidCount) ||
		bidCount < 0
	) {
		return null
	}
	if (currentHighestBid !== null && typeof currentHighestBid !== 'number') {
		return null
	}
	if (
		typeof revision !== 'number' ||
		!Number.isInteger(revision) ||
		revision < 0
	) {
		return null
	}

	return {
		productId,
		bidCount,
		currentHighestBid:
			typeof currentHighestBid === 'number' ? currentHighestBid : null,
		revision,
	}
}

export function useAuctionBidUpdates(productId: string) {
	const dispatch = useAppDispatch()
	const store = useStore<RootState>()
	const [liveUpdate, setLiveUpdate] = useState<AuctionBidUpdatePayload | null>(
		null,
	)

	useEffect(() => {
		setLiveUpdate(null)

		const socket = getSocket()
		if (!socket || !productId) return

		const joinAuction = () => {
			socket.emit(SOCKET_EVENTS.JOIN_AUCTION, productId)
		}

		const refetchAuction = () => {
			setLiveUpdate(null)
			dispatch(
				auctionsApi.util.prefetch('getAuctionById', productId, {
					force: true,
				}),
			)
		}

		const handleBidUpdate = (value: unknown) => {
			const payload = parseAuctionBidUpdate(value)
			if (!payload || payload.productId !== productId) return

			const cachedRevision =
				auctionsApi.endpoints.getAuctionById.select(productId)(
					store.getState(),
				).data?.revision

			setLiveUpdate((current) => {
				const currentRevision = Math.max(
					current?.revision ?? 0,
					cachedRevision ?? 0,
				)
				if (!isNewerRevision(payload.revision, currentRevision)) {
					return current
				}
				return payload
			})

			dispatch(
				auctionsApi.util.updateQueryData(
					'getAuctionById',
					productId,
					(draft) => {
						if (!isNewerRevision(payload.revision, draft.revision)) {
							return
						}
						draft.bidCount = payload.bidCount
						draft.currentHighestBid = payload.currentHighestBid
						draft.revision = payload.revision
					},
				),
			)
		}

		socket.on('connect', joinAuction)
		socket.io.on('reconnect', refetchAuction)
		socket.on(SOCKET_EVENTS.AUCTION_BID_UPDATE, handleBidUpdate)

		if (socket.connected) {
			joinAuction()
		} else {
			socket.connect()
		}

		return () => {
			socket.off('connect', joinAuction)
			socket.io.off('reconnect', refetchAuction)
			socket.off(SOCKET_EVENTS.AUCTION_BID_UPDATE, handleBidUpdate)
			socket.emit(SOCKET_EVENTS.LEAVE_AUCTION, productId)
		}
	}, [dispatch, productId, store])

	return liveUpdate?.productId === productId ? liveUpdate : null
}
