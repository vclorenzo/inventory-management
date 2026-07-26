"use client";

import { useAdressDropdowns } from "@/hooks/useAddressDropdown";
import { Address } from "@/types/pages/Profile";
import { useMemo } from "react";

const findName = <T extends { code: string; name: string }>(
  items: T[] | undefined,
  code?: string | null,
  fallback?: string | null,
) => {
  if (fallback) return fallback;
  if (!code) return undefined;
  return items?.find((item) => item.code === code)?.name ?? undefined;
};

type AddressLineProps = {
  address: Address;
};

const AddressLine = ({ address }: AddressLineProps) => {
  const { regions, provinces, cities, barangays } = useAdressDropdowns({
    regionCode: address.regionCode ?? undefined,
    provinceCode: address.provinceCode ?? undefined,
    cityCode: address.cityCode ?? undefined,
  });

  const line = useMemo(() => {
    const parts = [
      address.streetName,
      findName(barangays.data, address.barangayCode, address.barangay),
      findName(cities.data, address.cityCode, address.city),
      findName(provinces.data, address.provinceCode, address.province),
      findName(regions.data, address.regionCode, address.region),
      address.postalCode,
    ].filter(Boolean);

    return parts.join(", ") || "No street details";
  }, [
    address.barangay,
    address.barangayCode,
    address.city,
    address.cityCode,
    address.postalCode,
    address.province,
    address.provinceCode,
    address.region,
    address.regionCode,
    address.streetName,
    barangays.data,
    cities.data,
    provinces.data,
    regions.data,
  ]);

  return <p className="text-sm text-gray-600">{line}</p>;
};

export default AddressLine;
