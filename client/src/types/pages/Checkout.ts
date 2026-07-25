export type CheckoutFormValues = {
  name: string;
  phone: string;
  streetAddress: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  postalCode: string;
  paymentMethod: string;
};

export type PaymentMethodOption = {
  value: string;
  label: string;
  description: string;
};
