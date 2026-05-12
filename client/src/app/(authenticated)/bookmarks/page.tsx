"use client";
import Header from "@/components/Header";
import { useGetProductsQuery } from "@/state/internal/productsApi";
import { CircularProgress } from "@mui/material";

type Props = {};

const columns: GridColDef[] = [
  { field: "productId", headerName: "ID", width: 90 },
  { field: "name", headerName: "Product Name", width: 200 },
  {
    field: "price",
    headerName: "Price",
    width: 110,
    type: "number",
    valueGetter: (value, row) => `$${row.price}`,
  },
  {
    field: "rating",
    headerName: "Rating",
    width: 110,
    type: "number",
    valueGetter: (value, row) => (row.rating ? row.rating : "N/A"),
  },
  {
    field: "stockQuantity",
    headerName: "Stock Quantity",
    width: 150,
    type: "number",
  },
];

const Bookmarks = (props: Props) => {
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
      <Header name="Bookmarks" />
    </div>
  );
};

export default Bookmarks;
