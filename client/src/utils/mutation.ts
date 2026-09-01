export function getMutationErrorMessage(error: unknown, fallback: string) {
	if (
		error &&
		typeof error === 'object' &&
		'data' in error &&
		error.data &&
		typeof error.data === 'object' &&
		'message' in error.data &&
		typeof error.data.message === 'string'
	) {
		return error.data.message
	}

	if (
		error &&
		typeof error === 'object' &&
		'message' in error &&
		typeof error.message === 'string' &&
		error.message
	) {
		return error.message
	}

	return fallback
}
