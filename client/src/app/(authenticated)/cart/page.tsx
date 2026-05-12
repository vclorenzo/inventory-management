"use client";
import Header from "@/components/Header";
import { useGetProductsQuery } from "@/state/internal/productsApi";
import { CircularProgress } from "@mui/material";

type Props = {};

const Cart = (props: Props) => {
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
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <Header name="Cart" />
    </div>
  );
};

export default Cart;
