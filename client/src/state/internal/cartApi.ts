import {
  AddCartItemRequest,
  CartGroup,
  UpdateCartItemRequest,
} from "@/types/pages/Cart";
import { api } from "../api";

export const cartApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<CartGroup[], void>({
      query: () => "/cart",
      transformResponse: (response: { data?: CartGroup[] }) =>
        Array.isArray(response?.data) ? response.data : [],
      providesTags: ["Cart"],
    }),

    addCartItem: builder.mutation<CartGroup[], AddCartItemRequest>({
      query: (body) => ({
        url: "/cart",
        method: "POST",
        body,
      }),
      transformResponse: (response: { data?: CartGroup[] }) =>
        Array.isArray(response?.data) ? response.data : [],
      invalidatesTags: ["Cart"],
    }),

    updateCartItem: builder.mutation<CartGroup[], UpdateCartItemRequest>({
      query: ({ id, quantity }) => ({
        url: `/cart/${id}`,
        method: "PUT",
        body: { quantity },
      }),
      transformResponse: (response: { data?: CartGroup[] }) =>
        Array.isArray(response?.data) ? response.data : [],
      invalidatesTags: ["Cart"],
    }),

    removeCartItem: builder.mutation<CartGroup[], string>({
      query: (id) => ({
        url: `/cart/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data?: CartGroup[] }) =>
        Array.isArray(response?.data) ? response.data : [],
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
} = cartApi;
