'use client'

import ProductModal from '@/app/(authenticated)/products/ProductModal'
import Cards from '@/components/Cards'
import { useMe } from '@/hooks/useMe'
import {
	useCreateProductMutation,
	useGetProductsQuery,
} from '@/state/internal/productsApi'
import { ProductFormValues } from '@/types/pages/Products'
import { CircularProgress } from '@mui/material'
import { SearchIcon } from 'lucide-react'
import { useState } from 'react'

function Marketplace() {
	const [searchTerm, setSearchTerm] = useState('')
	const [isModalOpen, setIsModalOpen] = useState(false)

	const { me } = useMe()
	const userId = me?.data.userId ?? ''

	const {
		data: products,
		isLoading,
		isError,
	} = useGetProductsQuery({
		search: searchTerm,
		listingType: 'marketplace',
		...(userId ? { excludeUserId: userId } : {}),
	})

	const [createProduct, { isLoading: isCreateProductLoading }] =
		useCreateProductMutation()

	const handleCreateProduct = async (productData: ProductFormValues) => {
		await createProduct({ ...productData, listingType: 'marketplace' })
	}

	if (isLoading) {
		return (
			<div className="py-4">
				<CircularProgress />
			</div>
		)
	}

	if (isError || !products) {
		return (
			<div className="py-4 text-center text-red-500">
				Failed to fetch products
			</div>
		)
	}

	return (
		<div className="mx-auto w-full pb-5">
			{/* SEARCH BAR */}
			<div className="mb-6">
				<div className="flex items-center rounded border-2 border-gray-200">
					<SearchIcon className="m-2 h-5 w-5 text-gray-500" />
					<input
						type="text"
						className="w-full rounded bg-white px-4 py-2"
						placeholder="Search Products..."
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value)
						}}
					/>
				</div>
			</div>
			{/* PRODUCTS LIST */}
			<div className="lg-grid-cols-5 grid grid-cols-1 justify-between gap-10 sm:grid-cols-4">
				{isLoading ? (
					<>
						<CircularProgress />
					</>
				) : (
					<Cards products={products} />
				)}
			</div>
			{/* MODAL */}
			<ProductModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false)
				}}
				onSend={handleCreateProduct}
				isProductLoading={isCreateProductLoading}
			/>
		</div>
	)
}

export default Marketplace
