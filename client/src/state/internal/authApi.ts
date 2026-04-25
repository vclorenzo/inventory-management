import {
  ChangePasswordRequest,
  ChangePasswordResponse,
  MeResponse,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
} from "@/types/pages/Auth";
import { api } from "../api";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signUp: builder.mutation<SignUpResponse, SignUpRequest>({
      query: (body) => ({
        url: "/auth/sign-up",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    signIn: builder.mutation<SignInResponse, SignInRequest>({
      query: (body) => ({
        url: "/auth/sign-in",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    signOut: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/auth/sign-out",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    me: builder.query<MeResponse, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
    changePassword: builder.mutation<
      ChangePasswordResponse,
      ChangePasswordRequest
    >({
      query: (body) => ({
        url: "/auth/change-password",
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useMeQuery,
  useSignUpMutation,
  useSignInMutation,
  useSignOutMutation,
  useChangePasswordMutation,
} = authApi;
