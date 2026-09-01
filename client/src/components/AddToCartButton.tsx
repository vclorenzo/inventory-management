'use client'

import MakeOfferModal from '@/components/MakeOfferModal'
import { useCart } from '@/hooks/useCart'
import { useMe } from '@/hooks/useMe'
import { useAddBidMutation } from '@/state/internal/bidsApi'
import { CircularProgress } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

type AddToCartButtonProps = {
	productId: string
	disabled?: boolean
	className?: string
	listingPrice?: number
	currentHighestBid?: number | null
	hasExistingBid?: boolean
}

function getRequestErrorMessage(error: unknown, fallback: string) {
	if (
		error &&
		typeof error === 'object' &&
		'data' in error &&
		error.data &&
		typeof error.data === 'object' &&
		'message' in error.data &&
		typeof error.data.message === 'string'
	) {
		return error.data.message
	}

	return fallback
}

function isUnauthorizedError(error: unknown) {
	return (
		error &&
		typeof error === 'object' &&
		'status' in error &&
		error.status === 401
	)
}

function AddToCartButton({
	productId,
	disabled = false,
	className = 'inline-flex justify-center rounded-lg bg-gray-900 px-4 py-2 w-full h-12 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60',
	listingPrice,
	currentHighestBid,
	hasExistingBid = false,
}: AddToCartButtonProps) {
	const router = useRouter()
	const pathname = usePathname()
	const isAuction = pathname.startsWith('/auctions')
	const { me } = useMe()
	const { addCartItem, addCartItemState } = useCart()
	const [addBid, addBidState] = useAddBidMutation()
	const isCartLoading = addCartItemState.isLoading
	const isBidLoading = addBidState.isLoading
	const isLoading = isAuction ? isBidLoading : isCartLoading
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)
	const isUpdatingBid = isAuction && hasExistingBid
	const label = isAuction
		? isUpdatingBid
			? 'Update Bid'
			: 'Place Bid'
		: 'Add to Cart'

	const handleAddToCart = async () => {
		setErrorMessage(null)

		try {
			await addCartItem({ productId, quantity: 1 }).unwrap()
			router.push('/cart')
		} catch (error) {
			if (isUnauthorizedError(error)) {
				router.push('/login')
				return
			}

			setErrorMessage(
				getRequestErrorMessage(error, 'Could not add item to cart'),
			)
		}
	}

	const handleConfirmOffer = async (offerPrice: number) => {
		setErrorMessage(null)

		try {
			await addBid({ productId, offerPrice }).unwrap()
			setIsOfferModalOpen(false)
		} catch (error) {
			if (isUnauthorizedError(error)) {
				router.push('/login')
				return
			}

			setErrorMessage(
				getRequestErrorMessage(error, 'Could not submit your bid'),
			)
		}
	}

	const handleButtonClick = async () => {
		if (!me) {
			router.push('/login')
			return
		}

		if (isAuction) {
			setErrorMessage(null)
			setIsOfferModalOpen(true)
			return
		}

		await handleAddToCart()
	}

	const handleCloseOfferModal = () => {
		if (isLoading) return
		setIsOfferModalOpen(false)
		setErrorMessage(null)
	}

	return (
		<div className="w-full">
			<button
				type="button"
				onClick={handleButtonClick}
				disabled={disabled || isLoading}
				className={className}
			>
				{isLoading ? (
					<span className="inline-flex items-center gap-2">
						<CircularProgress size={18} color="inherit" />
						{isAuction
							? isUpdatingBid
								? 'Updating bid…'
								: 'Placing bid…'
							: 'Adding…'}
					</span>
				) : (
					label
				)}
			</button>
			{errorMessage && !isOfferModalOpen && (
				<p className="mt-2 text-center text-sm text-red-600">
					{errorMessage}
				</p>
			)}
			{isAuction && (
				<MakeOfferModal
					isOpen={isOfferModalOpen}
					isSubmitting={isBidLoading}
					listingPrice={listingPrice}
					currentHighestBid={currentHighestBid}
					hasExistingBid={hasExistingBid}
					errorMessage={errorMessage}
					onClose={handleCloseOfferModal}
					onConfirm={handleConfirmOffer}
				/>
			)}
		</div>
	)
}

export default AddToCartButton
