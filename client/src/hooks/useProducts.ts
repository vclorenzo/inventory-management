import {
  ProductQueryParams,
  useCreateProductMutation,
  useGetProductByIdQuery,
  useGetProductsQuery,
  useUpdateProductMutation,
} from "@/state/internal/productsApi";

export const useProducts = (params?: string | ProductQueryParams) => {
  const query = useGetProductsQuery(params);
  const [createProduct, createProductState] = useCreateProductMutation();

  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createProduct,
    createProductState,
  };
};

export const useProductById = (productId: string) => {
  const query = useGetProductByIdQuery(productId, { skip: !productId });

  const [updateProduct, updateProductState] = useUpdateProductMutation();
  return {
    product: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateProduct,
    updateProductState,
  };
};
