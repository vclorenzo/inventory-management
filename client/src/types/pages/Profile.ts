export type Profile = {
  email: string;
  name: string | undefined;
  gender?: string | null;
  contactNumber?: string | null;
  birthday?: string | null;
  region?: string | null | undefined;
  province?: string | null | undefined;
  city?: string | null | undefined;
  barangay?: string | null | undefined;
};

export type ProfileResponse = {
  message: string;
  updatedProfile: {
    email: string;
    updatedProfile: {
      profileId: string;
      userId: string;
      gender: string | null;
      contactNumber: string | null;
      birthday: string | null;
      region: string | null;
      province: string | null;
      city: string | null;
      barangay: string | null;
      created_at: string;
      updated_at: string;
    };
  };
};

export type ProfileRequest = {
  name: string;
  gender?: string;
  contactNumber?: string;
  birthday?: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
};
