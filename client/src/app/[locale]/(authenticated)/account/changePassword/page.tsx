'use client'

import ReactHookForm from '@/components/forms/ReactHookForm'
import Header from '@/components/Header'
import SectionCard from '@/components/SectionCard'
import { buildChangePasswordFields } from '@/constants/ChangePasswordForm'
import { useMe } from '@/hooks/useMe'
import { useChangePasswordMutation } from '@/state/internal/authApi'
import { ReusableFieldConfig } from '@/types/components/ReactHookForm'
import { ChangePasswordFormValues } from '@/types/pages/User'
import { getPasswordRequirementStatus } from '@/utils/password'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

function PasswordRequirementsChecklist({ password }: { password: string }) {
	const requirements = getPasswordRequirementStatus(password)

	return (
		<ul className="mb-2 mt-1 space-y-1 text-sm" aria-live="polite">
			{requirements.map((requirement) => (
				<li
					key={requirement.id}
					className={requirement.met ? 'text-green-700' : 'text-gray-500'}
				>
					<span className="mr-1.5" aria-hidden>
						{requirement.met ? '✔' : '✖'}
					</span>
					{requirement.label}
				</li>
			))}
		</ul>
	)
}

const ChangePassword = () => {
	const { me, isLoading: isMeLoading } = useMe()
	const userId = me?.data.userId
	const [changePassword, { isLoading: isChangeLoading }] =
		useChangePasswordMutation()
	const [formError, setFormError] = useState<string | null>(null)
	const [formSuccess, setFormSuccess] = useState<string | null>(null)

	const form = useForm<ChangePasswordFormValues>({
		defaultValues: {
			oldPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	})

	const { watch, getValues, trigger } = form
	const newPassword = watch('newPassword')

	useEffect(() => {
		const confirm = getValues('confirmPassword')
		if (!confirm) return
		void trigger('confirmPassword')
	}, [newPassword, getValues, trigger])

	const onSubmit = async (data: ChangePasswordFormValues) => {
		setFormError(null)
		setFormSuccess(null)
		if (!userId) {
			setFormError(
				'Unable to verify your account. Please refresh and try again.',
			)
			return
		}
		try {
			await changePassword({
				oldPassword: data.oldPassword,
				newPassword: data.newPassword,
			}).unwrap()
			setFormSuccess('Your password has been updated.')
			form.reset({
				oldPassword: '',
				newPassword: '',
				confirmPassword: '',
			})
		} catch (err: unknown) {
			const e = err as { data?: { message?: string } }
			setFormError(
				e?.data?.message ?? 'Could not update your password. Please try again.',
			)
		}
	}

	const fields: ReusableFieldConfig<ChangePasswordFormValues>[] = useMemo(
		() => buildChangePasswordFields({ getValues }),
		[getValues],
	)

	const isSubmitting = isChangeLoading || isMeLoading

	return (
		<div className="flex w-full flex-col items-center">
			<div className="flex w-full max-w-2xl flex-col gap-4">
				<Header name="Change Password" />
				<form
					className="flex w-full flex-col gap-4"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<SectionCard title="Password Details">
						{formError ? (
							<div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
								{formError}
							</div>
						) : null}
						{formSuccess ? (
							<div className="mb-4 rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-sm text-green-700">
								{formSuccess}
							</div>
						) : null}
						<ReactHookForm
							form={form}
							fields={fields}
							onSubmit={onSubmit}
							renderAs="div"
							showSubmit={false}
							className="flex flex-col gap-4"
						>
							<PasswordRequirementsChecklist password={newPassword ?? ''} />
						</ReactHookForm>
					</SectionCard>
					<button
						type="submit"
						disabled={isSubmitting}
						className={`h-[50px] w-[150px] rounded px-4 py-2 ${
							isSubmitting
								? 'cursor-not-allowed bg-blue-300 text-white'
								: 'bg-blue-500 text-white hover:bg-blue-700'
						}`}
					>
						Save
					</button>
				</form>
			</div>
		</div>
	)
}

export default ChangePassword
