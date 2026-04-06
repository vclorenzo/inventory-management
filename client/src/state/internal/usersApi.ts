import { api } from '../api';
import { User } from '@/types/User';

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['Users'],
    }),
  }),
});

export const { useGetAllUsersQuery } = usersApi;