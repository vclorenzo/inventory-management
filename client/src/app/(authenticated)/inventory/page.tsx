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
import { useState, type ReactNode } from 'react'
import Tabs from '@/components/Tabs'
import { getMutationErrorMessage } from '@/utils/mutation'

type InventoryTab = 'marketplace' | 'auctions'

const INVENTORY_TABS: InventoryTab[] = ['marketplace', 'auctions']

function InventoryPanel({
	isReady,
	isLoading,
	isError,
	errorMessage,
	children,
}: {
	isReady: boolean
	isLoading: boolean
	isError: boolean
	errorMessage: string
	children: ReactNode
}) {
	if (isLoading || !isReady) {
		return (
			<div className="py-4">
				<CircularProgress />
			</div>
		)
	}

	if (isError) {
		return <div className="py-4 text-center text-red-500">{errorMessage}</div>
	}

	return children
}

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
		try {
			await createProduct(productData).unwrap()
			setIsModalOpen(false)
		} catch (error) {
			throw new Error(
				getMutationErrorMessage(error, 'Failed to create product'),
			)
		}
	}

	const handleCreateAuction = async (auctionData: AuctionFormValues) => {
		try {
			await createAuction(auctionData).unwrap()
			setIsModalOpen(false)
		} catch (error) {
			throw new Error(
				getMutationErrorMessage(error, 'Failed to create auction'),
			)
		}
	}

	const handleTabChange = (index: number) => {
		setTab(INVENTORY_TABS[index] ?? 'marketplace')
		setIsModalOpen(false)
	}

	const isMarketplace = tab === 'marketplace'

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

			<Tabs
				activeIndex={isMarketplace ? 0 : 1}
				onChange={handleTabChange}
				tabs={[
					{
						label: 'Marketplace',
						content: (
							<InventoryPanel
								isReady={Boolean(userId)}
								isLoading={isProductsLoading}
								isError={isProductsError}
								errorMessage="Failed to fetch products"
							>
								<ProductsDataTable products={products ?? []} />
							</InventoryPanel>
						),
					},
					{
						label: 'Auctions',
						content: (
							<InventoryPanel
								isReady={Boolean(userId)}
								isLoading={isAuctionsLoading}
								isError={isAuctionsError}
								errorMessage="Failed to fetch auctions"
							>
								<AuctionsDataTable auctions={auctions ?? []} />
							</InventoryPanel>
						),
					},
				]}
			/>

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
