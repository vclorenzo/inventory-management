'use client'

import { SOCKET_EVENTS, AuctionBidUpdatePayload } from '@/constants/socket'
import { getSocket } from '@/lib/socket'
import { auctionsApi } from '@/state/internal/auctionsApi'
import { useAppDispatch } from '@/state/redux'
import { useEffect, useState } from 'react'

function parseAuctionBidUpdate(
	value: unknown,
): AuctionBidUpdatePayload | null {
	if (!value || typeof value !== 'object') return null

	const payload = value as Record<string, unknown>
	const { productId, bidCount, currentHighestBid } = payload

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
	if (
		currentHighestBid !== null &&
		typeof currentHighestBid !== 'number'
	) {
		return null
	}

	return {
		productId,
		bidCount,
		currentHighestBid:
			typeof currentHighestBid === 'number' ? currentHighestBid : null,
	}
}

export function useAuctionBidUpdates(productId: string) {
	const dispatch = useAppDispatch()
	const [liveUpdate, setLiveUpdate] =
		useState<AuctionBidUpdatePayload | null>(null)

	useEffect(() => {
		setLiveUpdate(null)

		const socket = getSocket()
		if (!socket || !productId) return

		const joinAuction = () => {
			socket.emit(SOCKET_EVENTS.JOIN_AUCTION, productId)
		}

		const handleBidUpdate = (value: unknown) => {
			const payload = parseAuctionBidUpdate(value)
			if (!payload || payload.productId !== productId) return

			setLiveUpdate(payload)
			dispatch(
				auctionsApi.util.updateQueryData(
					'getAuctionById',
					productId,
					(draft) => {
						draft.bidCount = payload.bidCount
						draft.currentHighestBid = payload.currentHighestBid
					},
				),
			)
		}

		socket.on('connect', joinAuction)
		socket.on(SOCKET_EVENTS.AUCTION_BID_UPDATE, handleBidUpdate)

		if (socket.connected) {
			joinAuction()
		} else {
			socket.connect()
		}

		return () => {
			socket.off('connect', joinAuction)
			socket.off(SOCKET_EVENTS.AUCTION_BID_UPDATE, handleBidUpdate)
			socket.emit(SOCKET_EVENTS.LEAVE_AUCTION, productId)
		}
	}, [dispatch, productId])

	return liveUpdate
}
