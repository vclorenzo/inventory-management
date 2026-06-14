"use client";
import { useGetProductByIdQuery } from "@/state/internal/productsApi";
import { CircularProgress, Rating } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import React from "react";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Package } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import AddToCartButton from "@/components/AddToCartButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Bookmark } from "lucide-react";
import { breadcrumbItems } from "@/app/(authenticated)/constants/User";

const productImageUrls = (length: number) => {
  const images = [];
  for (let i = 0; i < length; i++) {
    images.push({
      src: `https://s3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com/product${
        Math.floor(Math.random() * 3) + 1
      }.png`,
    });
  }

  return images;
};

const stockTone = (qty: number) => {
  if (qty <= 0) return "bg-red-50 text-red-700 ring-red-200";
  if (qty <= 10) return "bg-amber-50 text-amber-800 ring-amber-200";
  return "bg-emerald-50 text-emerald-800 ring-emerald-200";
};

const AuctionDetails = ({ params }: { params: { productId: string } }) => {
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useGetProductByIdQuery(params.productId);

  if (isLoading) {
    return (
      <div className="w-full py-10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <CircularProgress />
          <div className="text-sm text-gray-600">Loading product…</div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="w-full py-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-red-700">
              <Package className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-red-900">
                We couldn’t load this product.
              </div>
              <div className="mt-1 text-sm text-red-800">
                Please try again, or go back to the products list.
              </div>
              {error && (
                <div className="mt-3 rounded-lg bg-white/70 p-3 text-xs text-red-900 ring-1 ring-red-200">
                  {typeof error === "string" ? error : JSON.stringify(error)}
                </div>
              )}
              <div className="mt-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const images = productImageUrls(3);
  const inStock = product.stockQuantity > 0;

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Breadcrumbs items={breadcrumbItems(product.name)} />
        {/* <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Products
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-gray-500">
            Product ID
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
            {product.productId}
          </span>
        </div> */}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <Swiper
            modules={[Navigation, Pagination, A11y]}
            spaceBetween={24}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            // scrollbar={{ hide: true }}
          >
            {images.map((image, idx) => (
              <SwiperSlide key={product.productId}>
                <div className="flex flex-row items-center gap-3 justify-center">
                  <Image
                    src={image.src}
                    alt={product.name}
                    width={150}
                    height={150}
                    className="h-72 w-72 rounded-2xl object-contain sm:h-[420px] sm:w-[420px]"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                {product.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="text-2xl font-semibold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${stockTone(
                    product.stockQuantity,
                  )}`}
                >
                  {inStock ? "In stock" : "Out of stock"}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              {typeof product.rating === "number" ? (
                <div className="flex items-center gap-2">
                  <Rating value={product.rating} precision={0.5} readOnly />
                  <span className="text-sm font-medium text-gray-800">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              ) : (
                <div className="text-sm text-gray-600">Not rated</div>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4">
            {/* <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-1"> */}
            <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100 flex justify-center">
              <div className="grid grid-cols-[120px_120px] gap-x-6 items-center">
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Category:
                </div>
                <div className="font-medium text-gray-900 text-left">
                  {product.productCategory}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100 flex justify-center">
              <div className="grid grid-cols-[120px_120px] gap-x-6 items-center">
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Brand:
                </div>
                <div className="font-medium text-gray-900 text-left">
                  {product.brand}
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100 flex justify-center">
              <div className="grid grid-cols-[120px_120px] gap-x-6 items-center">
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Condition:
                </div>
                <div className="font-medium text-gray-900 text-left">
                  {product.condition}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row justify-center">
            <AddToCartButton
              productId={product.productId}
              disabled={!inStock}
            />
            <Link
              href="/products"
              className="inline-flex justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              <Bookmark />
            </Link>
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row justify-center">
            <Link
              href="/products"
              className="inline-flex justify-center items-center rounded-lg bg-gray-900 px-4 py-2 w-full h-12 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Browse more products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;
