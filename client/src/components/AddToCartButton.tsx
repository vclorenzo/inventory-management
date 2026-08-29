'use client'

import MakeOfferModal from '@/components/MakeOfferModal'
import { useCart } from '@/hooks/useCart'
import { useMe } from '@/hooks/useMe'
import { CircularProgress } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

type AddToCartButtonProps = {
	productId: string
	disabled?: boolean
	className?: string
	listingPrice?: number
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
}: AddToCartButtonProps) {
	const router = useRouter()
	const pathname = usePathname()
	const isAuction = pathname.startsWith('/auctions')
	const { me } = useMe()
	const { addCartItem, addCartItemState } = useCart()
	const isLoading = addCartItemState.isLoading
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)
	const label = isAuction ? 'Make Offer' : 'Add to Cart'

	const handleAddToCart = async () => {
		setErrorMessage(null)

		try {
			await addCartItem({ productId, quantity: 1 }).unwrap()
			setIsOfferModalOpen(false)
			router.push(isAuction ? '/bids' : '/cart')
		} catch (error) {
			if (isUnauthorizedError(error)) {
				router.push('/login')
				return
			}

			setErrorMessage(
				getRequestErrorMessage(
					error,
					isAuction
						? 'Could not submit your offer'
						: 'Could not add item to cart',
				),
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
				{isLoading && !isAuction ? (
					<span className="inline-flex items-center gap-2">
						<CircularProgress size={18} color="inherit" />
						Adding…
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
					isSubmitting={isLoading}
					listingPrice={listingPrice}
					errorMessage={errorMessage}
					onClose={handleCloseOfferModal}
					onConfirm={handleAddToCart}
				/>
			)}
		</div>
	)
}

export default AddToCartButton
