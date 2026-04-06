import { Product, NewProduct } from '@/types/Products';
import { api } from '../api';

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], string | void>({
      query: (search) => ({
        url: '/products',
        params: search ? { search } : {},
      }),
      transformResponse: (response: { products?: Product[] }) =>
        Array.isArray(response?.products) ? response.products : [],
      providesTags: ['Products'],
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => `products/${id}`,
      transformResponse: (response: { product: Product }) => response.product,
    }),

    createProduct: builder.mutation<Product, NewProduct>({
      query: (newProduct) => ({
        url: '/products',
        method: 'POST',
        body: newProduct,
      }),
      invalidatesTags: ['Products'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
} = productsApi;