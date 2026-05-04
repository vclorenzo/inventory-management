"use client";
import Cards from "@/components/Cards";
import Header from "@/components/Header";
import { useProducts } from "@/hooks/useProducts";
import { ProductFormValues } from "@/types/pages/Products";
import { CircularProgress } from "@mui/material";
import { PlusCircleIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import ProductModal from "../app/(authenticated)/products/ProductModal";

type Props = {};

const ProductsCatalog = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    products,
    createProduct,
    createProductState,
    isLoading: isGetProductsLoading,
    isError: hasGetProductsError,
  } = useProducts();
  const handleCreateProduct = async (productData: ProductFormValues) => {
    await createProduct(productData).unwrap();
  };

  if (isGetProductsLoading) {
    return (
      <div className="py-4">
        <CircularProgress />
      </div>
    );
  }

  if (hasGetProductsError || !products) {
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
      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name="Products" />
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" />
          Create Product
        </button>
      </div>
      {/* PRODUCTS LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-4 lg-grid-cols-5 gap-10 justify-between">
        {isGetProductsLoading ? (
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
          setIsModalOpen(false);
        }}
        onSend={handleCreateProduct}
        isProductLoading={createProductState.isLoading}
      />
    </div>
  );
};

export default ProductsCatalog;
