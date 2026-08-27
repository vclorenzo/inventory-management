"use client";

import { useCart } from "@/hooks/useCart";
import { useMe } from "@/hooks/useMe";
import { CircularProgress } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type AddToCartButtonProps = {
  productId: string;
  disabled?: boolean;
  className?: string;
};

function AddToCartButton({
  productId,
  disabled = false,
  className = "inline-flex justify-center rounded-lg bg-gray-900 px-4 py-2 w-full h-12 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60",
}: AddToCartButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuction = pathname.startsWith("/auctions");
  const { me } = useMe();
  const { addCartItem, addCartItemState } = useCart();
  const isLoading = addCartItemState.isLoading;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const label = isAuction ? "Make Offer" : "Add to Cart";

  const handleAddToCart = async () => {
    if (!me) {
      router.push("/login");
      return;
    }

    setErrorMessage(null);

    try {
      await addCartItem({ productId, quantity: 1 }).unwrap();
      router.push("/cart");
    } catch (error) {
      const message =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : "Could not add item to cart";

      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 401
      ) {
        router.push("/login");
        return;
      }

      setErrorMessage(message);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled || isLoading}
        className={className}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <CircularProgress size={18} color="inherit" />
            Adding…
          </span>
        ) : (
          label
        )}
      </button>
      {errorMessage && (
        <p className="mt-2 text-center text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}

export default AddToCartButton;
