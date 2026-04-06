import { useGetAllUsersQuery } from "@/state/internal/usersApi"


export const useUsers = () => {
  const query = useGetAllUsersQuery()

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error
  }
}