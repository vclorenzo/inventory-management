'use client'

import Header from '@/components/Header'
import ReactHookForm from '@/components/forms/ReactHookForm'
import { buildProfileDetailsFields } from '@/constants/ProfileForm'
import { useMe } from '@/hooks/useMe'
import { useProfile } from '@/hooks/useProfile'
import { useUpdateProfileMutation } from '@/state/internal/profileApi'
import { UserFormValues } from '@/types/pages/User'
import { CircularProgress } from '@mui/material'
import { Lock } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

const SectionCard = ({
	title,
	description,
	action,
	children,
}: {
	title: string
	description?: React.ReactNode
	action?: React.ReactNode
	children: React.ReactNode
}) => (
	<section className="rounded-sm border border-[#ebebeb] bg-white shadow-sm">
		<div className="flex items-start justify-between gap-3 border-b border-[#ebebeb] bg-[#f5f5f5] px-4 py-3">
			<div>
				<h2 className="text-sm font-semibold text-gray-800">{title}</h2>
				{description ? (
					<div className="mt-1 text-xs text-gray-500">{description}</div>
				) : null}
			</div>
			{action}
		</div>
		<div className="p-4">{children}</div>
	</section>
)

const Profile = () => {
	const [updateProfile, { isLoading: isUpdateLoading }] =
		useUpdateProfileMutation()
	const { me, isLoading: isMeLoading } = useMe()
	const userId = me?.data.userId

	const {
		profile,
		isLoading: isProfileLoading,
		error: hasProfileError,
	} = useProfile(userId ?? '')

	const form = useForm<UserFormValues>()
	const { reset, handleSubmit } = form

	useEffect(() => {
		if (!profile) return
		reset({
			name: profile.name ?? '',
			email: profile.email ?? '',
			gender: (profile.gender as UserFormValues['gender']) ?? '',
			contactNumber: profile.contactNumber ?? '',
			birthday: profile.birthday ? profile.birthday.slice(0, 10) : '',
		})
	}, [profile, reset])

	const detailsFields = useMemo(() => buildProfileDetailsFields(), [])
	const addresses = profile?.addresses ?? []

	const onSubmitProfile = (data: UserFormValues) => {
		if (!userId) return
		const { email: _email, ...payload } = data
		updateProfile({ userId, ...payload })
	}

	if (isMeLoading || isProfileLoading || isUpdateLoading) {
		return (
			<div className="py-4">
				<CircularProgress />
			</div>
		)
	}

	if (hasProfileError) {
		return (
			<div className="py-4 text-center text-red-500">
				Failed to fetch profile
			</div>
		)
	}

	return (
		<div className="flex w-full flex-col gap-4">
			<Header name="Profile" />

			<form
				className="flex max-w-2xl flex-col gap-4"
				onSubmit={handleSubmit(onSubmitProfile)}
			>
				<SectionCard title="Profile Details">
					<ReactHookForm
						form={form}
						fields={detailsFields}
						onSubmit={onSubmitProfile}
						renderAs="div"
						showSubmit={false}
						className="flex flex-col gap-4"
					/>
				</SectionCard>

				<button
					type="submit"
					disabled={isUpdateLoading}
					className={`h-[50px] w-[150px] rounded px-4 py-2 ${
						isUpdateLoading
							? 'cursor-not-allowed bg-blue-300 text-white'
							: 'bg-blue-500 text-white hover:bg-blue-700'
					}`}
				>
					Save
				</button>
			</form>
		</div>
	)
}

export default Profile
