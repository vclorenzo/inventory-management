"use client";
import { CircularProgress } from "@mui/material";
import { useMemo, useState } from "react";
import { A11y, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import Breadcrumbs from "@/components/Breadcrumbs";
import { useProductById } from "@/hooks/useProducts";
import { ProductFormValues } from "@/types/pages/Products";
import { productToFormValues } from "@/utils/productForm";
import {
  ChevronLeft,
  ExternalLink,
  MapPin,
  Package,
  Pen,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { breadcrumbItems } from "../../constants/User";
import ProductModal from "../ProductModal";
import Reviews from "@/components/Reviews";
import ProfileBanner from "@/components/ProfileBanner";
import ProductRating from "@/components/ProductRating";

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

const statusTone = (status: string) => {
  const normalized = status.trim().toLowerCase();
  if (normalized === "available")
    return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (normalized === "unavailable")
    return "bg-rose-50 text-rose-800 ring-rose-200";
  if (normalized === "unlisted")
    return "bg-slate-50 text-slate-700 ring-slate-200";
  return "bg-gray-50 text-gray-800 ring-gray-200";
};

const ProductDetails = ({ params }: { params: { productId: string } }) => {
  const {
    product,
    isLoading: isGetProductsLoading,
    isError: hasGetProductsError,
    updateProduct,
    updateProductState,
  } = useProductById(params.productId);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const modalDefaultValues = useMemo(
    () => (product ? productToFormValues(product) : undefined),
    [product],
  );

  const handleUpdateProduct = async (productData: ProductFormValues) => {
    await updateProduct({
      productId: params.productId,
      ...productData,
    }).unwrap();
  };

  const handleMarkAsReserved = async () => {
    if (!product) return;
    const values = productToFormValues(product);
    await updateProduct({
      productId: params.productId,
      ...values,
      status: "Unavailable",
    }).unwrap();
  };
  const handleMarkAsUnlisted = async () => {
    if (!product) return;
    const values = productToFormValues(product);
    await updateProduct({
      productId: params.productId,
      ...values,
      status: "Unlisted",
    }).unwrap();
  };

  if (isGetProductsLoading) {
    return (
      <div className="w-full py-10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <CircularProgress />
          <div className="text-sm text-gray-600">Loading product…</div>
        </div>
      </div>
    );
  }

  if (hasGetProductsError || !product) {
    return (
      <div className="w-full py-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-red-700">
              <Package className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-red-900">
                We couldn’t load this products.
              </div>
              <div className="mt-1 text-sm text-red-800">
                Please try again, or go back to the products list.
              </div>
              {hasGetProductsError && (
                <div className="mt-3 rounded-lg bg-white/70 p-3 text-xs text-red-900 ring-1 ring-red-200">
                  {typeof hasGetProductsError === "string"
                    ? hasGetProductsError
                    : JSON.stringify(hasGetProductsError)}
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
  const paymentMethods = Array.isArray(product.paymentMethods)
    ? product.paymentMethods
    : [];
  const meetupLocations = Array.isArray(product.meetupLocations)
    ? product.meetupLocations
    : [];
  const shippingDetails =
    typeof product.shippingDetails === "string" &&
    product.shippingDetails.trim()
      ? product.shippingDetails
      : null;

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Breadcrumbs items={breadcrumbItems(product.name)} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <Swiper
            className="pb-11 [&_.swiper-button-next]:text-gray-700 [&_.swiper-button-prev]:text-gray-700 [&_.swiper-pagination-bullet-active]:bg-gray-900 [&_.swiper-slide]:h-auto"
            modules={[Navigation, Pagination, A11y]}
            spaceBetween={16}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
          >
            {images.map((image: any, idx: number) => (
              <SwiperSlide key={`${product.productId}-gallery-${idx}`}>
                <div className="flex min-h-[280px] items-center justify-center p-6 sm:min-h-[360px] sm:p-8">
                  <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.9),transparent_55%)]" />
                  <div className="relative mx-auto flex aspect-square w-full max-w-[320px] items-center justify-center sm:max-w-[360px]">
                    <Image
                      src={image.src}
                      alt={`${product.name}`}
                      width={150}
                      height={150}
                      priority={idx === 0}
                      className="h-full w-full rounded-2xl object-contain drop-shadow-md"
                    />
                  </div>
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
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusTone(
                    product.status,
                  )}`}
                >
                  {product.status}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <ProductRating
                rating={product.rating}
                reviewCount={product.reviewCount}
              />
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
            <button
              type="button"
              disabled={
                product.status === "Unavailable" ||
                product.status === "Unlisted" ||
                updateProductState.isLoading
              }
              className="inline-flex justify-center items-center rounded-lg bg-gray-900 px-4 py-2 w-full h-12 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleMarkAsReserved}
            >
              Mark as Reserved
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              <Pencil />
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row justify-center">
            <button
              onClick={handleMarkAsUnlisted}
              disabled={
                product.status === "Unlisted" || updateProductState.isLoading
              }
              className="inline-flex justify-center items-center rounded-lg bg-gray-900 px-4 py-2 w-full h-12 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Unlist
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Description</h2>
          <div className="mt-4 space-y-4 text-gray-700">
            {product.description}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            Transaction Details
          </h2>
          <div className="mt-6 space-y-5">
            <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100 flex flex-col justify-center">
              <p className="text-xl font-semibold text-gray-900">Payment</p>
              {paymentMethods.length > 0 ? (
                <ul className="mt-2 space-y-1 text-gray-700">
                  {paymentMethods.map((method) => (
                    <li key={method}>- {method}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700">No payment methods provided.</p>
              )}
            </div>
            <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100 flex flex-col justify-center">
              <p className="text-xl font-semibold text-gray-900">Meet-up</p>
              {meetupLocations.length > 0 ? (
                <div className="mt-2 space-y-2 text-gray-700">
                  {meetupLocations.map((location) => (
                    <div
                      key={location.name}
                      className="flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <Link href={location.mapLink}>{location.name}</Link>
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-gray-700">
                  No meet-up locations provided.
                </p>
              )}
            </div>
            <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100 flex flex-col justify-center">
              <p className="text-xl font-semibold text-gray-900">Shipping</p>
              <p className="mt-1 text-gray-700">
                {shippingDetails ?? "No shipping details provided."}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <Reviews productId={product.productId} />
        </div>
        <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <ProfileBanner userId={product.userId} />
          <div className="mt-6 flex min-h-0 flex-1 flex-col">
            <Reviews userId={product.userId} />
          </div>
        </div>
      </div>
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onSend={handleUpdateProduct}
        isProductLoading={updateProductState.isLoading}
        defaultValues={modalDefaultValues}
      />
    </div>
  );
};

export default ProductDetails;
