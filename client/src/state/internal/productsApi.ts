import { Product, NewProduct } from "@/types/pages/Products";
import { api } from "../api";
import { url } from "inspector";

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], string | void>({
      query: (search) => ({
        url: "/products",
        params: search ? { search } : {},
      }),
      transformResponse: (response: { data?: Product[] }) =>
        Array.isArray(response?.data) ? response.data : [],
      providesTags: ["Products"],
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => `products/${id}`,
      transformResponse: (response: { data: Product }) => response.data,
    }),

    createProduct: builder.mutation<Product, NewProduct>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Products"],
    }),
    updateProduct: builder.mutation<Product, Product>({
      query: ({ productId, ...body }) => ({
        url: `/products/${productId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} = productsApi;
