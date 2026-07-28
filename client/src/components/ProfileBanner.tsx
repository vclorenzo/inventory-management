import { Rating } from '@mui/material'
import { MapPin } from 'lucide-react'
import React from 'react'
import { useMe } from '@/hooks/useMe'

const ProfileBanner = () => {
	const { me } = useMe()
	const { name, email } = me?.data ?? { name: '', email: '' }
	const initials = (name || email || '?').trim().charAt(0).toUpperCase()
	return (
		<div className="flex flex-col justify-center rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100">
			<article className="space-y-2">
				<div className="flex flex-col items-center justify-center gap-2">
					<div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl text-sm font-semibold uppercase text-white">
						{initials}
					</div>
					<div className="flex items-center gap-2">
						<p className="text-xl font-semibold text-gray-900">{name}</p>
					</div>
				</div>
			</article>
			<div className="mt-5 flex justify-center gap-5">
				<div className="flex items-center gap-2">
					<span className="text-gray-700">5.0</span>
					<Rating value={5} readOnly size="small" />
					<span className="text-gray-500">(11)</span>
				</div>
				<div className="flex items-center gap-2">
					<MapPin className="h-4 w-4 text-gray-500" />
					<span>Pateros</span>
				</div>
			</div>
		</div>
	)
}

export default ProfileBanner
