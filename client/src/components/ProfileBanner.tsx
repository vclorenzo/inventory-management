import { Rating } from '@mui/material'
import { MapPin } from 'lucide-react'
import { useMemo } from 'react'
import { useMe } from '@/hooks/useMe'
import { useProfile } from '@/hooks/useProfile'
import { useReviews } from '@/hooks/useReviews'
import { useUser } from '@/hooks/useUser'
import Link from 'next/link'

type Props = {
	userId?: string
}

/** Average = sum of star ratings / total ratings received. */
function averageRating(ratings: number[]): number | null {
	if (ratings.length === 0) return null
	const sum = ratings.reduce((total, value) => total + value, 0)
	return sum / ratings.length
}

const ProfileBanner = ({ userId }: Props) => {
	const { me } = useMe()
	const resolvedUserId = userId ?? me?.data.userId ?? ''
	const { user, isLoading: isUserLoading } = useUser(userId ?? '')
	const { reviews, isLoading: isReviewsLoading } = useReviews(resolvedUserId)
	const { profile: userProfile, isLoading: isProfileLoading } =
		useProfile(resolvedUserId)

	const profile = userId
		? { name: user?.name ?? '', email: user?.email ?? '' }
		: { name: me?.data.name ?? '', email: me?.data.email ?? '' }

	const { name, email } = profile
	const initials = (name || email || '?').trim().charAt(0).toUpperCase()

	const { average, count } = useMemo(() => {
		const ratings = reviews.map((review) => review.rating)
		return {
			average: averageRating(ratings),
			count: ratings.length,
		}
	}, [reviews])

	const city = useMemo(() => {
		const addresses = userProfile?.addresses ?? []
		const preferred =
			addresses.find((address) => address.isDefault) ?? addresses[0]
		return preferred?.city?.trim() || null
	}, [userProfile?.addresses])

	if (
		(userId && isUserLoading) ||
		(resolvedUserId && (isReviewsLoading || isProfileLoading))
	) {
		return (
			<div className="flex flex-col justify-center rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100">
				<p className="text-center text-sm text-gray-500">Loading profile...</p>
			</div>
		)
	}

	const displayAverage = average ?? 0
	const displayAverageLabel = average === null ? '—' : average.toFixed(1)

	return (
		<div className="flex flex-col justify-center rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100">
			<Link href={`/account/${userId}`}>
				<article className="space-y-2">
					<div className="flex flex-col items-center justify-center gap-2">
						<div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl font-semibold uppercase text-white">
							{initials}
						</div>
						<div className="flex items-center gap-2">
							<p className="text-xl font-semibold text-gray-900">
								{name || 'Unknown seller'}
							</p>
						</div>
					</div>
				</article>
			</Link>
			<div className="mt-5 flex justify-center gap-5">
				<div className="flex items-center gap-2">
					<span className="text-gray-700">{displayAverageLabel}</span>
					<Rating
						value={displayAverage}
						precision={0.1}
						readOnly
						size="small"
					/>
					<span className="text-gray-500">({count})</span>
				</div>
				<div className="flex items-center gap-2">
					<MapPin className="h-4 w-4 text-gray-500" />
					<span>{city ?? '—'}</span>
				</div>
			</div>
		</div>
	)
}

export default ProfileBanner
