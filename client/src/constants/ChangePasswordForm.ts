import type { ReusableFieldConfig } from '@/types/components/ReactHookForm'
import type { ChangePasswordFormValues } from '@/types/pages/User'
import { validatePasswordStrength } from '@/utils/password'
import type { UseFormGetValues } from 'react-hook-form'

type Args = {
	getValues: UseFormGetValues<ChangePasswordFormValues>
}

export function buildChangePasswordFields({
	getValues,
}: Args): ReusableFieldConfig<ChangePasswordFormValues>[] {
	return [
		{
			name: 'oldPassword',
			label: 'Old Password',
			type: 'password',
			autoComplete: 'current-password',
			rules: {
				required: 'Current password is required',
			},
		},
		{
			name: 'newPassword',
			label: 'New Password',
			type: 'password',
			autoComplete: 'new-password',
			rules: {
				required: 'New password is required',
				maxLength: {
					value: 128,
					message: 'New password must be at most 128 characters',
				},
				validate: {
					strength: (value: string) => validatePasswordStrength(value),
					differentFromOld: (value: string) => {
						const old = getValues('oldPassword')
						if (!value || !old) return true
						if (value === old) {
							return 'New password must be different from your current password'
						}
						return true
					},
				},
			},
		},
		{
			name: 'confirmPassword',
			label: 'Confirm Password',
			type: 'password',
			autoComplete: 'new-password',
			rules: {
				required: 'Please confirm your new password',
				validate: (value: string) => {
					if (!value) return true
					const next = getValues('newPassword')
					return value === next || 'Passwords do not match'
				},
			},
		},
	]
}
