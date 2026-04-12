import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/state/internal/profileApi";

export const useProfile = (userId: string) => {
  const query = useGetProfileQuery(userId, { skip: !userId });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
};
