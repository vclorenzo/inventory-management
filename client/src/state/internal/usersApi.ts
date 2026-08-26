import {
  GetUserByIdResponse,
  User,
  UserRequest,
  UserResponse,
} from "@/types/pages/User";
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
    getUserById: builder.query<User, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "GET",
      }),
      transformResponse: (response: GetUserByIdResponse) => response.user,
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

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} = usersApi;
