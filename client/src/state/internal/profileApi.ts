import {
  Profile,
  ProfileRequest,
  ProfileResponse,
} from "@/types/pages/Profile";
import { api } from "../api";

type GetProfileResponse = {
  message: string;
  data: Profile;
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
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
