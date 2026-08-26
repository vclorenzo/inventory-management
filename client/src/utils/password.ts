export type PasswordRequirement = {
	id: string
	label: string
	test: (password: string) => boolean
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
	{
		id: 'length',
		label: 'At least 12 characters',
		test: (password) => password.length >= 12,
	},
	{
		id: 'uppercase',
		label: 'One uppercase letter',
		test: (password) => /[A-Z]/.test(password),
	},
	{
		id: 'lowercase',
		label: 'One lowercase letter',
		test: (password) => /[a-z]/.test(password),
	},
	{
		id: 'number',
		label: 'One number',
		test: (password) => /\d/.test(password),
	},
	{
		id: 'special',
		label: 'One special character',
		test: (password) => /[^A-Za-z0-9]/.test(password),
	},
]

export function getPasswordRequirementStatus(password: string) {
	return PASSWORD_REQUIREMENTS.map((requirement) => ({
		id: requirement.id,
		label: requirement.label,
		met: requirement.test(password ?? ''),
	}))
}

export function validatePasswordStrength(password: string) {
	const unmet = getPasswordRequirementStatus(password).filter(
		(requirement) => !requirement.met,
	)
	if (unmet.length === 0) return true
	return 'Password does not meet all requirements'
}
