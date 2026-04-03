interface Issue {
	message: string;
}

interface ValidationError {
	issues?: Issue[];
}

export const formatValidationError = (
	errors: ValidationError | null | undefined,
): string => {
	if (!errors || !errors.issues) return 'Validation failed';
	if (Array.isArray(errors.issues))
		return errors.issues.map((i) => i.message).join(', ');
	return JSON.stringify(errors);
};
