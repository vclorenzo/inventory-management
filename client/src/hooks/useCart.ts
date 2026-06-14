import {
  useAddCartItemMutation,
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/state/internal/cartApi";

export const useCart = () => {
  const query = useGetCartQuery();
  const [addCartItem, addCartItemState] = useAddCartItemMutation();
  const [updateCartItem, updateCartItemState] = useUpdateCartItemMutation();
  const [removeCartItem, removeCartItemState] = useRemoveCartItemMutation();

  return {
    cartGroups: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    addCartItem,
    addCartItemState,
    updateCartItem,
    updateCartItemState,
    removeCartItem,
    removeCartItemState,
  };
};
