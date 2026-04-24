import { useGetAllUsersQuery, useUpdateUserMutation } from "@/state/internal/usersApi"


export const useUsers = () => {
  const query = useGetAllUsersQuery()
  const [updateUser, updateUserState] = useUpdateUserMutation()

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,

    updateUser,
    updateUserState,
  }
}