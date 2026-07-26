'use client'

import AddressManager from '@/components/AddressManager'
import Header from '@/components/Header'
import { useMe } from '@/hooks/useMe'
import { useProfile } from '@/hooks/useProfile'
import { CircularProgress } from '@mui/material'

const Address = () => {
	const { me, isLoading: isMeLoading } = useMe()
	const userId = me?.data.userId

	const {
		profile,
		isLoading: isProfileLoading,
		error: hasProfileError,
	} = useProfile(userId ?? '')

	if (isMeLoading || isProfileLoading) {
		return (
			<div className="py-4">
				<CircularProgress />
			</div>
		)
	}

	if (hasProfileError || !userId) {
		return (
			<div className="py-4 text-center text-red-500">
				Failed to fetch profile
			</div>
		)
	}

	return (
		<div className="flex w-full flex-col gap-4">
			<Header name="Address" />
			<div className="max-w-2xl">
				<AddressManager
					userId={userId}
					addresses={profile?.addresses ?? []}
					defaultRecipient={{
						name: profile?.name,
						contactNumber: profile?.contactNumber,
					}}
				/>
			</div>
		</div>
	)
}

export default Address
