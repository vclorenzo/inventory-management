import {
  Address,
  AddressRequest,
  Profile,
  ProfileRequest,
  ProfileResponse,
} from "@/types/pages/Profile";
import { api } from "../api";

type GetProfileResponse = {
  message: string;
  data: Profile;
};

type AddressMutationResponse = {
  message: string;
  data: Address;
};

export const profileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<Profile, string>({
      query: (userId) => ({
        url: `/profile/${userId}`,
        method: "GET",
      }),
      transformResponse: (response: GetProfileResponse) => response.data,
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation<
      ProfileResponse,
      ProfileRequest & { userId: string }
    >({
      query: ({ userId, ...body }) => ({
        url: `/profile/${userId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    createAddress: builder.mutation<
      Address,
      AddressRequest & { userId: string }
    >({
      query: ({ userId, ...body }) => ({
        url: `/profile/${userId}/addresses`,
        method: "POST",
        body,
      }),
      transformResponse: (response: AddressMutationResponse) => response.data,
      invalidatesTags: ["Profile"],
    }),
    updateAddress: builder.mutation<
      Address,
      AddressRequest & { userId: string; addressId: string }
    >({
      query: ({ userId, addressId, ...body }) => ({
        url: `/profile/${userId}/addresses/${addressId}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: AddressMutationResponse) => response.data,
      invalidatesTags: ["Profile"],
    }),
    deleteAddress: builder.mutation<
      { addressId: string },
      { userId: string; addressId: string }
    >({
      query: ({ userId, addressId }) => ({
        url: `/profile/${userId}/addresses/${addressId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = profileApi;
