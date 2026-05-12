"use client";

import Header from "@/components/Header";
import { ProductsDataTable } from "@/components/ProductsDataTable";
import { useGetProductsQuery } from "@/state/internal/productsApi";
import { CircularProgress } from "@mui/material";

type Props = {};

const Inventory = (props: Props) => {
  const { data: products, isError, isLoading } = useGetProductsQuery(undefined);

  if (isLoading) {
    return (
      <div className="py-4">
        <CircularProgress />
      </div>
    );
  }

  if (isError || !products) {
    return (
      <div className="py-4 text-center text-red-500">
        Failed to fetch products
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <Header name="Inventory" />
      <ProductsDataTable products={products} />
    </div>
  );
};

export default Inventory;
