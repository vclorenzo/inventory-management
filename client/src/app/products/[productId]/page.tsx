'use client';
import { useGetProductByIdQuery } from '@/state/api';
import { CircularProgress, Rating } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import React from 'react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import Image from 'next/image';

const ProductDetails = ({ params }: { params: { productId: string } }) => {
	const {
		data: product,
		isLoading,
		isError,
	} = useGetProductByIdQuery(params.productId);

	if (isLoading) {
		return (
			<div className="py-4">
				<CircularProgress />
			</div>
		);
	}

	if (isError || !product) {
		return (
			<div className="text-center text-red-500 py-4">
				Failed to fetch products
			</div>
		);
	}

	return (
		<div>
			<Swiper
				// install Swiper modules
				modules={[Navigation, Pagination, Scrollbar, A11y]}
				spaceBetween={50}
				slidesPerView={1}
				navigation
				pagination={{ clickable: true }}
				scrollbar={{ draggable: true }}
				onSwiper={(swiper) => console.log(swiper)}
				onSlideChange={() => console.log('slide change')}
			>
				<SwiperSlide>
					<div className="flex flex-row items-center gap-3 justify-center">
						<Image
							src={`https://s3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com/product${
								Math.floor(Math.random() * 3) + 1
							}.png`}
							alt={product.name}
							width={150}
							height={150}
							className="mb-3 rounded-2xl w-36 h-36"
						/>
					</div>
				</SwiperSlide>
				<SwiperSlide>
					<div className="flex flex-row items-center gap-3 justify-center">
						<Image
							src={`https://s3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com/product${
								Math.floor(Math.random() * 3) + 1
							}.png`}
							alt={product.name}
							width={150}
							height={150}
							className="mb-3 rounded-2xl w-36 h-36"
						/>
					</div>
				</SwiperSlide>
				<SwiperSlide>
					<div className="flex flex-row items-center gap-3 justify-center">
						<Image
							src={`https://s3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com/product${
								Math.floor(Math.random() * 3) + 1
							}.png`}
							alt={product.name}
							width={150}
							height={150}
							className="mb-3 rounded-2xl w-36 h-36"
						/>
					</div>
				</SwiperSlide>
				<SwiperSlide>
					<div className="flex flex-row items-center gap-3 justify-center">
						<Image
							src={`https://s3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com/product${
								Math.floor(Math.random() * 3) + 1
							}.png`}
							alt={product.name}
							width={150}
							height={150}
							className="mb-3 rounded-2xl w-36 h-36"
						/>
					</div>
				</SwiperSlide>
			</Swiper>
			<div className="flex flex-col w-full justify-center items-center">
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
			</div>
		</div>

		// <div>
		// 	<p>{product.name}</p>
		// 	<p>{product.price}</p>
		// 	<p>{product.rating}</p>
		// 	<p>{product.stockQuantity}</p>
		// </div>
	);
};

export default ProductDetails;
