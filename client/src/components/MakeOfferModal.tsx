'use client'

import { X } from 'lucide-react'
import { FormEvent, useEffect, useId, useState } from 'react'

type MakeOfferModalProps = {
	isOpen: boolean
	isSubmitting?: boolean
	listingPrice?: number
	currentHighestBid?: number | null
	hasExistingBid?: boolean
	errorMessage?: string | null
	onClose: () => void
	onConfirm: (amount: number) => void | Promise<void>
}

function parseOfferAmount(value: string) {
	const amount = Number(value)
	if (!value.trim() || Number.isNaN(amount) || amount <= 0) {
		return null
	}
	return amount
}

function MakeOfferModal({
	isOpen,
	isSubmitting = false,
	listingPrice,
	currentHighestBid,
	hasExistingBid = false,
	errorMessage,
	onClose,
	onConfirm,
}: MakeOfferModalProps) {
	const titleId = useId()
	const amountId = useId()
	const [amount, setAmount] = useState('')
	const [validationError, setValidationError] = useState<string | null>(null)

	useEffect(() => {
		if (!isOpen) return
		setAmount('')
		setValidationError(null)
	}, [isOpen])

	useEffect(() => {
		if (!isOpen) return

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && !isSubmitting) {
				onClose()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, isSubmitting, onClose])

	if (!isOpen) return null

	const hasLeadingBid =
		currentHighestBid != null && Number.isFinite(currentHighestBid)
	const minimumBid = hasLeadingBid
		? currentHighestBid
		: listingPrice
	const mustExceedLeading = hasLeadingBid

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault()
		const offerAmount = parseOfferAmount(amount)

		if (offerAmount === null) {
			setValidationError('Enter a valid offer amount.')
			return
		}

		if (
			mustExceedLeading &&
			minimumBid != null &&
			offerAmount <= minimumBid
		) {
			setValidationError(
				`Bid must exceed the current highest bid of P${minimumBid.toFixed(2)}.`,
			)
			return
		}

		if (
			!mustExceedLeading &&
			listingPrice != null &&
			offerAmount < listingPrice
		) {
			setValidationError(
				`Bid must be at least the starting price of P${listingPrice.toFixed(2)}.`,
			)
			return
		}

		setValidationError(null)
		await onConfirm(offerAmount)
	}

	const displayError = validationError ?? errorMessage

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
			onClick={() => {
				if (!isSubmitting) onClose()
			}}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-lg"
				onClick={(event) => event.stopPropagation()}
			>
				<header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
					<h2 id={titleId} className="text-lg font-semibold text-gray-900">
						{hasExistingBid ? 'Update bid' : 'Place a bid'}
					</h2>
					<button
						type="button"
						onClick={onClose}
						disabled={isSubmitting}
						className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-60"
						aria-label="Close"
					>
						<X className="h-5 w-5" />
					</button>
				</header>

				<form onSubmit={handleSubmit} className="px-5 py-5">
					<label
						htmlFor={amountId}
						className="text-sm font-medium text-gray-800"
					>
						Bid amount
					</label>
					{listingPrice != null && (
						<p className="mt-1 text-xs text-gray-500">
							{hasLeadingBid && minimumBid != null
								? `Current highest bid P${minimumBid.toFixed(2)}. Your bid must be higher.`
								: `Starting price at P${listingPrice.toFixed(2)}`}
						</p>
					)}
					<div className="relative mt-2">
						<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">
							P
						</span>
						<input
							id={amountId}
							type="number"
							inputMode="decimal"
							min={
								minimumBid != null
									? mustExceedLeading
										? Number((minimumBid + 0.01).toFixed(2))
										: minimumBid
									: 0.01
							}
							step="0.01"
							autoFocus
							value={amount}
							onChange={(event) => {
								setAmount(event.target.value)
								if (validationError) setValidationError(null)
							}}
							disabled={isSubmitting}
							placeholder="0.00"
							className="w-full rounded-lg border border-gray-300 py-2.5 pl-7 pr-3 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-400 disabled:bg-gray-50"
						/>
					</div>

					{displayError && (
						<p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
							{displayError}
						</p>
					)}

					<div className="mt-6 flex justify-end gap-2">
						<button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSubmitting ? 'Confirming…' : 'Confirm'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default MakeOfferModal
