import { useMeQuery } from '@/state/internal/authApi';

export const useMe = () => {
	const query = useMeQuery();

	return {
		me: query.data ?? null,
		isLoading: query.isLoading,
		error: query.error,
	};
};