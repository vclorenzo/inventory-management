'use client'

import Header from '@/components/Header'
import { useCart } from '@/hooks/useCart'
import { CartGroup, CartItem } from '@/types/pages/Cart'
import { saveCheckoutSelectedIds } from '@/utils/checkout'
import { CircularProgress } from '@mui/material'
import { Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

const formatPrice = (amount: number, currency: string) =>
	`${currency}${amount.toLocaleString('en-PH')}`

const Cart = () => {
	const router = useRouter()
	const {
		cartGroups,
		isLoading,
		isError,
		updateCartItem,
		updateCartItemState,
		removeCartItem,
		removeCartItemState,
	} = useCart()

	const isUpdating = updateCartItemState.isLoading
	const isRemoving = removeCartItemState.isLoading

	const allItems = useMemo(
		() => cartGroups.flatMap((group) => group.items),
		[cartGroups],
	)

	const [selectedIds, setSelectedIds] = useState<string[]>([])

	useEffect(() => {
		const validIds = new Set(allItems.map((item) => item.id))
		setSelectedIds((prev) => prev.filter((id) => validIds.has(id)))
	}, [allItems])

	const allItemIds = allItems.map((item) => item.id)
	const allSelected =
		allItemIds.length > 0 && allItemIds.every((id) => selectedIds.includes(id))

	const isShopFullySelected = (group: CartGroup) => {
		const groupItemIds = group.items.map((item) => item.id)
		return (
			groupItemIds.length > 0 &&
			groupItemIds.every((id) => selectedIds.includes(id))
		)
	}

	const toggleSelectAll = () => {
		setSelectedIds(allSelected ? [] : allItemIds)
	}

	const toggleItem = (id: string) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
		)
	}

	const toggleShop = (group: CartGroup) => {
		const groupItemIds = group.items.map((item) => item.id)
		const next = !isShopFullySelected(group)

		setSelectedIds((prev) => {
			if (next) {
				return Array.from(new Set([...prev, ...groupItemIds]))
			}
			return prev.filter((id) => !groupItemIds.includes(id))
		})
	}

	const handleCheckout = () => {
		saveCheckoutSelectedIds(selectedIds)
		router.push('/checkout')
	}

	const updateQuantity = async (item: CartItem, delta: number) => {
		const nextQty = Math.max(1, Math.min(item.stockLeft, item.quantity + delta))

		if (nextQty === item.quantity) return

		await updateCartItem({ id: item.id, quantity: nextQty })
	}

	const handleRemoveItem = async (id: string) => {
		await removeCartItem(id)
	}

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4">
				<Header name="Cart" />
				<div className="flex min-h-[240px] items-center justify-center rounded-sm border border-[#ebebeb] bg-white">
					<CircularProgress />
				</div>
			</div>
		)
	}

	if (isError) {
		return (
			<div className="flex flex-col gap-4">
				<Header name="Cart" />
				<div className="rounded-sm border border-red-200 bg-red-50 p-6 text-sm text-red-800">
					We couldn&apos;t load your cart. Please try again.
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<Header name="Cart" />

			<div className="rounded-sm border border-[#ebebeb] bg-white shadow-sm">
				<div className="grid grid-cols-[40px_minmax(0,1fr)_120px_140px_120px_100px] items-center gap-4 border-b border-[#ebebeb] bg-[#f5f5f5] px-4 py-3 text-sm text-gray-500">
					<label className="flex cursor-pointer items-center justify-center">
						<input
							type="checkbox"
							checked={allSelected}
							onChange={toggleSelectAll}
							className="accent-primary h-[18px] w-[18px]"
						/>
					</label>
					<span>Product</span>
					<span className="text-center">Unit Price</span>
					<span className="text-center">Quantity</span>
					<span className="text-center">Total Price</span>
					<span className="text-center">Actions</span>
				</div>

				{cartGroups.length === 0 ? (
					<div className="px-4 py-12 text-center text-sm text-gray-500">
						Your cart is empty.
					</div>
				) : (
					cartGroups.map((group) => (
						<div
							className="flex flex-col border border-[#ebebeb]"
							key={group.shop.name}
						>
							<div className="flex items-center gap-3 border-b border-[#ebebeb] px-4 py-3">
								<input
									type="checkbox"
									checked={isShopFullySelected(group)}
									onChange={() => toggleShop(group)}
									className="accent-primary mx-3 h-[18px] w-[18px]"
								/>

								<span className="text-sm font-medium text-gray-800">
									{group.shop.name}
								</span>
							</div>

							{group.items.map((item) => {
								const totalPrice = item.unitPrice * item.quantity

								return (
									<div
										key={item.id}
										className="grid grid-cols-[40px_minmax(0,1fr)_120px_140px_120px_100px] items-start gap-4 border-b border-[#ebebeb] px-10 py-5 last:border-b-0"
									>
										<label className="mt-8 flex cursor-pointer items-start justify-center">
											<input
												type="checkbox"
												checked={selectedIds.includes(item.id)}
												onChange={() => toggleItem(item.id)}
												className="accent-primary h-[18px] w-[18px]"
											/>
										</label>

										<div className="flex gap-4">
											<div className="relative h-[80px] w-[80px] shrink-0 overflow-hidden border border-[#ebebeb] bg-white">
												<Image
													src={item.image}
													alt={item.title}
													fill
													className="object-cover"
													sizes="80px"
												/>
											</div>

											<div className="flex min-w-0 items-center">
												<p className="line-clamp-2 text-sm text-gray-900">
													{item.title}
												</p>
											</div>
										</div>

										<div className="mt-8 text-center text-sm text-gray-700">
											{formatPrice(item.unitPrice, item.currency)}
										</div>

										<div className="mt-6 flex flex-col items-center">
											<div className="flex items-center">
												<button
													type="button"
													onClick={() => updateQuantity(item, -1)}
													disabled={
														item.quantity <= 1 || isUpdating || isRemoving
													}
													className="flex h-8 w-8 items-center justify-center border border-[#ebebeb] bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
													aria-label="Decrease quantity"
												>
													<Minus className="h-3.5 w-3.5" />
												</button>
												<input
													type="text"
													readOnly
													value={item.quantity}
													className="h-8 w-12 border-y border-[#ebebeb] text-center text-sm text-gray-800 outline-none"
												/>
												<button
													type="button"
													onClick={() => updateQuantity(item, 1)}
													disabled={
														item.quantity >= item.stockLeft ||
														isUpdating ||
														isRemoving
													}
													className="flex h-8 w-8 items-center justify-center border border-[#ebebeb] bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
													aria-label="Increase quantity"
												>
													<Plus className="h-3.5 w-3.5" />
												</button>
											</div>
											<p className="text-primary mt-1 text-xs">
												{item.stockLeft} items left
											</p>
										</div>

										<div className="text-primary mt-8 text-center text-base font-medium">
											{formatPrice(totalPrice, item.currency)}
										</div>

										<div className="mt-8 flex flex-col items-center gap-2 text-sm">
											<button
												type="button"
												onClick={() => handleRemoveItem(item.id)}
												disabled={isRemoving || isUpdating}
												className="hover:text-primary text-gray-600 transition-colors disabled:opacity-50"
											>
												Delete
											</button>
										</div>
									</div>
								)
							})}
						</div>
					))
				)}
			</div>
			<button
				type="submit"
				disabled={selectedIds.length === 0}
				onClick={handleCheckout}
				className={`mt-2 h-[50px] w-[150px] rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700`}
			>
				Checkout
			</button>
		</div>
	)
}

export default Cart
