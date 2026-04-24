import { User, UserRequest, UserResponse } from "@/types/User";
import { api } from "../api";

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<User[], void>({
      query: () => ({
        url: "/users",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),
    updateUser: builder.mutation<
      UserResponse,
      UserRequest & { userId: string }
    >({
      query: ({ userId, ...body }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const { useGetAllUsersQuery, useUpdateUserMutation } = usersApi;
