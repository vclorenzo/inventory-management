export type Profile = {
  email: string;
  name: string | undefined;
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
      region: string;
      province: string;
      city: string;
      barangay: string;
      created_at: string;
      updated_at: string;
    };
  };
};

export type ProfileRequest = {
  name: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
};
