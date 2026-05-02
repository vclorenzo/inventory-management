import { Product, ProductFormValues } from "@/types/pages/Products";

const emptyMeetupLocation = () => ({
  name: "",
  address: "",
  mapLink: "",
});

export function productToFormValues(product: Product): ProductFormValues {
  const locations = Array.isArray(product.meetupLocations)
    ? product.meetupLocations.map((l) => ({
        name: typeof l?.name === "string" ? l.name : "",
        address: typeof l?.address === "string" ? l.address : "",
        mapLink: typeof l?.mapLink === "string" ? l.mapLink : "",
      }))
    : [];

  return {
    name: product.name,
    productCategory: product.productCategory,
    brand: product.brand,
    condition: product.condition,
    price: product.price,
    stockQuantity: product.stockQuantity,
    status: product.status,
    rating: typeof product.rating === "number" ? product.rating : 0,
    description: product.description,
    paymentMethods: Array.isArray(product.paymentMethods)
      ? [...product.paymentMethods]
      : [],
    meetupLocations: locations.length > 0 ? locations : [emptyMeetupLocation()],
    shippingDetails:
      product.shippingDetails === null || product.shippingDetails === undefined
        ? ""
        : product.shippingDetails,
  };
}
