"use client";
import { CircularProgress, Rating } from "@mui/material";
import { useMemo, useState } from "react";
import { A11y, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import Breadcrumbs from "@/components/Breadcrumbs";
import { useProductById } from "@/hooks/useProducts";
import { ProductFormValues } from "@/types/pages/Products";
import { productToFormValues } from "@/utils/productForm";
import { ChevronLeft, ExternalLink, MapPin, Package, Pen } from "lucide-react";
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

const productImageUrls = (length: number) => {
  const images = [];
  for (let i = 0; i < length; i++) {
    images.push({
      src: `https://s3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com/products${
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
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusTone(
                    product.status,
                  )}`}
                >
                  {product.status}
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
              <Pen />
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
              Delete
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
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <ProfileBanner />
        <Reviews />
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
