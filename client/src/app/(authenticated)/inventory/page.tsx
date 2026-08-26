'use client'

import ProductModal from '@/app/(authenticated)/products/ProductModal'
import Header from '@/components/Header'
import { ProductsDataTable } from '@/components/ProductsDataTable'
import { useMe } from '@/hooks/useMe'
import {
	useCreateProductMutation,
	useGetProductsQuery,
} from '@/state/internal/productsApi'
import { ProductFormValues } from '@/types/pages/Products'
import { CircularProgress } from '@mui/material'
import { PlusCircleIcon } from 'lucide-react'
import { useState } from 'react'

function Inventory() {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { me } = useMe()
	const userId = me?.data.userId ?? ''
	const {
		data: products,
		isError,
		isLoading,
	} = useGetProductsQuery({ userId }, { skip: !userId })

	const [createProduct, { isLoading: isCreateProductLoading }] =
		useCreateProductMutation()

	const handleCreateProduct = async (productData: ProductFormValues) => {
		await createProduct(productData).unwrap()
		setIsModalOpen(false)
	}

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
					Create Product
				</button>
			</div>

			{isLoading || !userId ? (
				<div className="py-4">
					<CircularProgress />
				</div>
			) : isError || !products ? (
				<div className="py-4 text-center text-red-500">
					Failed to fetch products
				</div>
			) : (
				<ProductsDataTable products={products} />
			)}

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

export default Inventory
