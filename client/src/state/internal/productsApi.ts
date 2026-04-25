import { Product, NewProduct } from "@/types/pages/Products";
import { api } from "../api";

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
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
} = productsApi;
