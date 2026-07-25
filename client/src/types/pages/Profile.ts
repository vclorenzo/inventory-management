export type Address = {
  addressId: string;
  profileId: string;
  label: string;
  streetName?: string | null;
  postalCode?: string | null;
  region?: string | null;
  province?: string | null;
  city?: string | null;
  barangay?: string | null;
  regionCode?: string | null;
  provinceCode?: string | null;
  cityCode?: string | null;
  barangayCode?: string | null;
  isDefault: boolean;
  created_at: string;
  updated_at: string;
};

export type AddressFormValues = {
  label: string;
  streetName: string;
  postalCode: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  isDefault: boolean;
};

export type Profile = {
  email: string;
  name: string | undefined;
  gender?: string | null;
  contactNumber?: string | null;
  birthday?: string | null;
  addresses?: Address[];
};

export type ProfileResponse = {
  message: string;
  updatedProfile: {
    email: string;
    name: string;
    updatedProfile: {
      profileId: string;
      userId: string;
      gender: string | null;
      contactNumber: string | null;
      birthday: string | null;
      created_at: string;
      updated_at: string;
      addresses: Address[];
    };
  };
};

export type ProfileRequest = {
  name: string;
  gender?: string;
  contactNumber?: string;
  birthday?: string;
};

export type AddressRequest = {
  label: string;
  streetName?: string;
  postalCode?: string;
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  regionCode?: string;
  provinceCode?: string;
  cityCode?: string;
  barangayCode?: string;
  isDefault?: boolean;
};
