"use client";

import AddressLine from "@/components/AddressLine";
import Header from "@/components/Header";
import ReactHookForm from "@/components/forms/ReactHookForm";
import {
  buildCheckoutShippingFields,
  PAYMENT_METHOD_OPTIONS,
} from "@/constants/CheckoutForm";
import { useAdressDropdowns } from "@/hooks/useAddressDropdown";
import { useCart } from "@/hooks/useCart";
import { useMe } from "@/hooks/useMe";
import { useProfile } from "@/hooks/useProfile";
import { SelectOption } from "@/types/components/ReactHookForm";
import { CheckoutFormValues } from "@/types/pages/Checkout";
import type { Address } from "@/types/pages/Profile";
import { loadCheckoutSelectedIds } from "@/utils/checkout";
import { CircularProgress } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

const SHIPPING_FEE = 50;

const formatPrice = (amount: number, currency: string) =>
  `${currency}${amount.toLocaleString("en-PH")}`;

const getDefaultAddress = (addresses: Address[]) =>
  addresses.find((address) => address.isDefault) ?? addresses[0];

const SectionCard = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="rounded-sm border border-[#ebebeb] bg-white shadow-sm">
    <div className="flex items-start justify-between gap-3 border-b border-[#ebebeb] bg-[#f5f5f5] px-4 py-3">
      <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      {action}
    </div>
    <div className="p-4">{children}</div>
  </section>
);

const Checkout = () => {
  const { cartGroups, isLoading, isError } = useCart();
  const { me, isLoading: isMeLoading } = useMe();
  const userId = me?.data.userId;
  const { profile, isLoading: isProfileLoading } = useProfile(userId ?? "");

  const [region, setRegion] = useState<string>();
  const [province, setProvince] = useState<string>();
  const [city, setCity] = useState<string>();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  const form = useForm<CheckoutFormValues>({
    defaultValues: {
      name: "",
      phone: "",
      streetAddress: "",
      region: "",
      province: "",
      city: "",
      barangay: "",
      postalCode: "",
      paymentMethod: "cod",
    },
  });

  const { setValue, reset, watch, register, handleSubmit, getValues } = form;
  const selectedPayment = watch("paymentMethod");
  const paymentError = form.formState.errors.paymentMethod?.message;
  const addresses = profile?.addresses ?? [];
  const hasAddresses = addresses.length > 0;

  useEffect(() => {
    setSelectedIds(loadCheckoutSelectedIds());
  }, []);

  const selectedGroups = useMemo(() => {
    if (!selectedIds) return [];

    const idSet = new Set(selectedIds);
    return cartGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => idSet.has(item.id)),
      }))
      .filter((group) => group.items.length > 0);
  }, [cartGroups, selectedIds]);

  const selectedItems = useMemo(
    () => selectedGroups.flatMap((group) => group.items),
    [selectedGroups],
  );

  const subtotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      ),
    [selectedItems],
  );

  const currency = selectedItems[0]?.currency ?? "₱";
  const total = subtotal + (selectedItems.length > 0 ? SHIPPING_FEE : 0);
  const itemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const applyAddressToForm = (
    address: Address | undefined,
    options?: { keepPayment?: boolean },
  ) => {
    const r = address?.regionCode ?? "";
    const p = address?.provinceCode ?? "";
    const c = address?.cityCode ?? "";
    const b = address?.barangayCode ?? "";

    setRegion(r || undefined);
    setProvince(p || undefined);
    setCity(c || undefined);

    reset({
      name: profile?.name ?? "",
      phone: profile?.contactNumber ?? "",
      streetAddress: address?.streetName ?? "",
      region: r,
      province: p,
      city: c,
      barangay: b,
      postalCode: address?.postalCode ?? "",
      paymentMethod: options?.keepPayment
        ? getValues("paymentMethod") || "cod"
        : "cod",
    });
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.addressId);
    applyAddressToForm(address, { keepPayment: true });
  };

  const handleChangeRegion = useMemo(
    () => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value || undefined;
      setRegion(value);
      setProvince(undefined);
      setCity(undefined);
      setValue("province", "");
      setValue("city", "");
      setValue("barangay", "");
    },
    [setValue],
  );

  const handleChangeProvince = useMemo(
    () => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value || undefined;
      setProvince(value);
      setCity(undefined);
      setValue("city", "");
      setValue("barangay", "");
    },
    [setValue],
  );

  const handleChangeCity = useMemo(
    () => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value || undefined;
      setCity(value);
      setValue("barangay", "");
    },
    [setValue],
  );

  useEffect(() => {
    if (!profile) return;

    const defaultAddress = getDefaultAddress(profile.addresses ?? []);
    setSelectedAddressId(defaultAddress?.addressId ?? null);

    const r = defaultAddress?.regionCode ?? "";
    const p = defaultAddress?.provinceCode ?? "";
    const c = defaultAddress?.cityCode ?? "";
    const b = defaultAddress?.barangayCode ?? "";

    setRegion(r || undefined);
    setProvince(p || undefined);
    setCity(c || undefined);

    reset({
      name: profile.name ?? "",
      phone: profile.contactNumber ?? "",
      streetAddress: defaultAddress?.streetName ?? "",
      region: r,
      province: p,
      city: c,
      barangay: b,
      postalCode: defaultAddress?.postalCode ?? "",
      paymentMethod: "cod",
    });
  }, [profile, reset]);

  const {
    regions,
    provinces,
    cities,
    barangays,
    isLoading: isAddressLoading,
    error: hasAddressError,
  } = useAdressDropdowns({
    regionCode: region,
    provinceCode: province,
    cityCode: city,
  });

  const regionValue = watch("region");
  const provinceValue = watch("province");
  const cityValue = watch("city");

  const regionOptions: SelectOption[] = useMemo(
    () => regions.data?.map((r) => ({ value: r.code, label: r.name })) ?? [],
    [regions.data],
  );

  const provinceOptions: SelectOption[] = useMemo(
    () => provinces.data?.map((p) => ({ value: p.code, label: p.name })) ?? [],
    [provinces.data],
  );

  const cityOptions: SelectOption[] = useMemo(
    () => cities.data?.map((c) => ({ value: c.code, label: c.name })) ?? [],
    [cities.data],
  );

  const barangayOptions: SelectOption[] = useMemo(
    () => barangays.data?.map((b) => ({ value: b.code, label: b.name })) ?? [],
    [barangays.data],
  );

  const shippingFields = useMemo(() => {
    const fields = buildCheckoutShippingFields({
      regionOptions,
      provinceOptions,
      cityOptions,
      barangayOptions,
      isRegionSelected: Boolean(region),
      isProvinceSelected: Boolean(province),
      isCitySelected: Boolean(city),
      regionValue,
      provinceValue,
      cityValue,
      handleChangeRegion,
      handleChangeProvince,
      handleChangeCity,
    });

    if (!hasAddresses) return fields;

    return fields.filter(
      (field) => field.name === "name" || field.name === "phone",
    );
  }, [
    barangayOptions,
    city,
    cityOptions,
    cityValue,
    handleChangeCity,
    handleChangeProvince,
    handleChangeRegion,
    hasAddresses,
    province,
    provinceOptions,
    provinceValue,
    region,
    regionOptions,
    regionValue,
  ]);

  const onSubmit = (data: CheckoutFormValues) => {
    setOrderPlaced(true);
    console.log("Order placed:", { ...data, items: selectedItems, total });
  };

  if (
    isLoading ||
    isMeLoading ||
    isProfileLoading ||
    (!hasAddresses && isAddressLoading) ||
    selectedIds === null
  ) {
    return (
      <div className="flex flex-col gap-4">
        <Header name="Checkout" />
        <div className="flex min-h-[240px] items-center justify-center rounded-sm border border-[#ebebeb] bg-white">
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (isError || hasAddressError) {
    return (
      <div className="flex flex-col gap-4">
        <Header name="Checkout" />
        <div className="rounded-sm border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          We couldn&apos;t load checkout details. Please try again.
        </div>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Header name="Checkout" />
        <div className="rounded-sm border border-[#ebebeb] bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            No items selected for checkout.
          </p>
          <Link
            href="/cart"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            Go back to cart
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="flex flex-col gap-4">
        <Header name="Checkout" />
        <div className="rounded-sm border border-green-200 bg-green-50 p-8 text-center">
          <p className="text-base font-medium text-green-800">
            Order placed successfully!
          </p>
          <p className="mt-2 text-sm text-green-700">
            Thank you for your purchase. You will receive a confirmation soon.
          </p>
          <Link
            href="/cart"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            Return to cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Header name="Checkout" />

      <form
        className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-4">
          <SectionCard
            title="Shipping Details"
            action={
              <Link
                href="/account/address"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Manage addresses
              </Link>
            }
          >
            <div className="flex flex-col gap-4">
              {hasAddresses ? (
                <fieldset className="flex flex-col gap-3">
                  <legend className="sr-only">Delivery address</legend>
                  {addresses.map((address) => {
                    const isSelected = selectedAddressId === address.addressId;

                    return (
                      <label
                        key={address.addressId}
                        className={`flex cursor-pointer items-start gap-3 rounded-sm border p-3 transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-[#ebebeb] hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedAddress"
                          value={address.addressId}
                          checked={isSelected}
                          onChange={() => handleSelectAddress(address)}
                          className="mt-1 accent-primary"
                        />
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {address.label}
                            </span>
                            {address.isDefault ? (
                              <span className="rounded bg-orange-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-orange-700">
                                Default
                              </span>
                            ) : null}
                          </span>
                          <AddressLine address={address} />
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              ) : (
                <div className="rounded-sm border border-dashed border-[#ebebeb] bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-500">
                    No saved addresses yet. Enter shipping details below or{" "}
                    <Link
                      href="/account/address"
                      className="text-blue-600 hover:underline"
                    >
                      add an address
                    </Link>
                    .
                  </p>
                </div>
              )}

              <ReactHookForm
                form={form}
                fields={shippingFields}
                onSubmit={onSubmit}
                renderAs="div"
                showSubmit={false}
                className="flex flex-col gap-4"
              />
            </div>
          </SectionCard>

          <SectionCard title="Payment Details">
            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">Payment method</legend>
              {PAYMENT_METHOD_OPTIONS.map((method) => (
                <label
                  key={method.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-sm border p-3 transition-colors ${
                    selectedPayment === method.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-[#ebebeb] hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={method.value}
                    className="mt-1 accent-primary"
                    {...register("paymentMethod", {
                      required: "Select a payment method",
                    })}
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-gray-900">
                      {method.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {method.description}
                    </span>
                  </span>
                </label>
              ))}
              {paymentError ? (
                <p className="text-sm text-red-600">{paymentError}</p>
              ) : null}
            </fieldset>
          </SectionCard>

          <button
            type="submit"
            className="h-[50px] w-[180px] rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 lg:hidden"
          >
            Place Order
          </button>
        </div>

        <aside className="flex h-fit flex-col gap-4 lg:sticky lg:top-4">
          <SectionCard title="Order Details">
            <div className="flex flex-col gap-4">
              {selectedGroups.map((group) => (
                <div key={group.shop.name} className="flex flex-col gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {group.shop.name}
                  </p>

                  {group.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-[#ebebeb] bg-white">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="line-clamp-2 text-sm text-gray-900">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          x{item.quantity}
                        </p>
                        <p className="text-sm font-medium text-primary">
                          {formatPrice(
                            item.unitPrice * item.quantity,
                            item.currency,
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <div className="border-t border-[#ebebeb] pt-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="mt-2 flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPrice(SHIPPING_FEE, currency)}</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-[#ebebeb] pt-3 text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(total, currency)}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          <button
            type="submit"
            className="hidden h-[50px] w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 lg:block"
          >
            Place Order
          </button>
        </aside>
      </form>
    </div>
  );
};

export default Checkout;
