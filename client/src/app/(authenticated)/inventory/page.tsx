'use client'

import AuctionModal from '@/app/(authenticated)/products/AuctionModal'
import ProductModal from '@/app/(authenticated)/products/ProductModal'
import { AuctionsDataTable } from '@/components/AuctionsDataTable'
import Header from '@/components/Header'
import { ProductsDataTable } from '@/components/ProductsDataTable'
import { useMe } from '@/hooks/useMe'
import {
	useCreateAuctionMutation,
	useGetAuctionsQuery,
} from '@/state/internal/auctionsApi'
import {
	useCreateProductMutation,
	useGetProductsQuery,
} from '@/state/internal/productsApi'
import { AuctionFormValues } from '@/types/pages/Auctions'
import { ProductFormValues } from '@/types/pages/Products'
import { CircularProgress } from '@mui/material'
import { PlusCircleIcon } from 'lucide-react'
import { useState } from 'react'

type InventoryTab = 'marketplace' | 'auctions'

function Inventory() {
	const [tab, setTab] = useState<InventoryTab>('marketplace')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { me } = useMe()
	const userId = me?.data.userId ?? ''
	const {
		data: products,
		isError: isProductsError,
		isLoading: isProductsLoading,
	} = useGetProductsQuery({ userId }, { skip: !userId })
	const {
		data: auctions,
		isError: isAuctionsError,
		isLoading: isAuctionsLoading,
	} = useGetAuctionsQuery({ userId }, { skip: !userId })

	const [createProduct, { isLoading: isCreateProductLoading }] =
		useCreateProductMutation()
	const [createAuction, { isLoading: isCreateAuctionLoading }] =
		useCreateAuctionMutation()

	const handleCreateProduct = async (productData: ProductFormValues) => {
		await createProduct(productData).unwrap()
		setIsModalOpen(false)
	}

	const handleCreateAuction = async (auctionData: AuctionFormValues) => {
		await createAuction(auctionData).unwrap()
		setIsModalOpen(false)
	}

	const isMarketplace = tab === 'marketplace'
	const isLoading = isMarketplace ? isProductsLoading : isAuctionsLoading
	const isError = isMarketplace ? isProductsError : isAuctionsError
	const hasRows = isMarketplace ? Boolean(products) : Boolean(auctions)

	return (
		<div className="flex flex-col">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<Header name="Inventory" />
				<button
					type="button"
					className="flex items-center justify-center rounded bg-blue-500 px-4 py-2 font-bold text-gray-200 hover:bg-blue-700 sm:shrink-0"
					onClick={() => setIsModalOpen(true)}
				>
					<PlusCircleIcon className="mr-2 h-5 w-5 !text-gray-200" />
					{isMarketplace ? 'Create Product' : 'Create Auction'}
				</button>
			</div>

			<div className="mt-4 flex gap-2">
				<button
					type="button"
					className={`rounded px-4 py-2 text-sm font-semibold ${
						isMarketplace
							? 'bg-gray-900 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
					onClick={() => {
						setTab('marketplace')
						setIsModalOpen(false)
					}}
				>
					Marketplace
				</button>
				<button
					type="button"
					className={`rounded px-4 py-2 text-sm font-semibold ${
						!isMarketplace
							? 'bg-gray-900 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
					onClick={() => {
						setTab('auctions')
						setIsModalOpen(false)
					}}
				>
					Auctions
				</button>
			</div>

			{isLoading || !userId ? (
				<div className="py-4">
					<CircularProgress />
				</div>
			) : isError || !hasRows ? (
				<div className="py-4 text-center text-red-500">
					{isMarketplace
						? 'Failed to fetch products'
						: 'Failed to fetch auctions'}
				</div>
			) : isMarketplace ? (
				<ProductsDataTable products={products ?? []} />
			) : (
				<AuctionsDataTable auctions={auctions ?? []} />
			)}

			{isMarketplace ? (
				<ProductModal
					isOpen={isModalOpen}
					onClose={() => {
						setIsModalOpen(false)
					}}
					onSend={handleCreateProduct}
					isProductLoading={isCreateProductLoading}
				/>
			) : (
				<AuctionModal
					isOpen={isModalOpen}
					onClose={() => {
						setIsModalOpen(false)
					}}
					onSend={handleCreateAuction}
					isAuctionLoading={isCreateAuctionLoading}
				/>
			)}
		</div>
	)
}

export default Inventory
