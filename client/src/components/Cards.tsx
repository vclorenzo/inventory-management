import { Product } from '@/types/Products';
import { Rating } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const Cards = ({ products }: { products: Product[] }) => {
	const pathname = usePathname();
	return products?.map((product) => (
		<div
			key={product.productId}
			className="border shadow rounded-md p-4 max-w-full w-full mx-auto"
		>
			<Link
				href={`/${pathname.includes('marketplace') ? 'marketplace' : 'products'}/${product.productId}`}
				className="flex flex-col items-center"
			>
				<Image
					src={`https://s3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com/product${
						Math.floor(Math.random() * 3) + 1
					}.png`}
					alt={product.name}
					width={150}
					height={150}
					className="mb-3 rounded-2xl w-36 h-36"
				/>

				<h3 className="text-lg text-gray-900 font-semibold">{product.name}</h3>
				<p className="text-gray-800">${product.price.toFixed(2)}</p>
				<div className="text-sm text-gray-600 mt-1">
					Stock: {product.stockQuantity}
				</div>
				{product.rating && (
					<div className="flex items-center mt-2">
						<Rating value={product.rating || 0} precision={0.5} readOnly />
					</div>
				)}
			</Link>
		</div>
	));
};

export default Cards;
