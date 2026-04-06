'use client';
import CreateProductModal from '@/app/products/CreateProductModal';
import Cards from '@/components/Cards';
import { useCreateProductMutation, useGetProductsQuery } from '@/state/internal/productsApi';
import { ProductFormData } from '@/types/Products';
import { CircularProgress } from '@mui/material';
import { SearchIcon } from 'lucide-react';
import { useState } from 'react';

type Props = {};

const Marketplace = (props: Props) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);

	const {
		data: products,
		isLoading,
		isError,
	} = useGetProductsQuery(searchTerm);

	const [createProduct] = useCreateProductMutation();
	const handleCreateProduct = async (productData: ProductFormData) => {
		await createProduct(productData);
	};

	if (isLoading) {
		return (
			<div className="py-4">
				<CircularProgress />
			</div>
		);
	}

	if (isError || !products) {
		return (
			<div className="text-center text-red-500 py-4">
				Failed to fetch products
			</div>
		);
	}

	return (
		<div className="mx-auto pb-5 w-full">
			{/* SEARCH BAR */}
			<div className="mb-6">
				<div className="flex items-center border-2 border-gray-200 rounded">
					<SearchIcon className="w-5 h-5 text-gray-500 m-2" />
					<input
						type="text"
						className="w-full py-2 px-4 rounded bg-white"
						placeholder="Search Products..."
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
						}}
					/>
				</div>
			</div>
			{/* PRODUCTS LIST */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg-grid-cols-3 gap-10 justify-between">
				{isLoading ? (
					<>
						<CircularProgress />
					</>
				) : (
					<Cards products={products} />
				)}
			</div>
			{/* MODAL */}
			<CreateProductModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
				}}
				onCreate={handleCreateProduct}
			/>
		</div>
	);
};

export default Marketplace;
