'use client'

import Header from '@/components/Header'
import Tabs from '@/components/Tabs'
import { CircularProgress } from '@mui/material'
import ProductsCatalog from '@/components/ProductsCatalog'
import Reviews from '@/components/Reviews'
import { useReviews } from '@/hooks/useReviews'
import ProfileBanner from '@/components/ProfileBanner'
import { useUser } from '@/hooks/useUser'
import { useParams } from 'next/navigation'

function SellerAccount() {
	const params = useParams<{ userId: string }>()
	const userId = params.userId ?? ''

	const { user, isLoading: isUserLoading, isError: hasUserError } =
		useUser(userId)

	const {
		reviews,
		isLoading: isReviewsLoading,
		isError: hasReviewsError,
	} = useReviews(userId)

	if (!userId) {
		return (
			<div className="py-4 text-center text-red-500">
				Seller not found
			</div>
		)
	}

	if (isUserLoading) {
		return (
			<div className="flex justify-center py-8">
				<CircularProgress />
			</div>
		)
	}

	if (hasUserError || !user) {
		return (
			<div className="py-4 text-center text-red-500">
				Failed to fetch seller account
			</div>
		)
	}

	return (
		<div className="w-full">
			<Header name={`${user.name}'s Account`} />
			<div className="mt-5 overflow-x-auto shadow-md">
				<table className="min-w-full rounded-lg bg-white">
					<tbody>
						<ProfileBanner userId={userId} />
					</tbody>
				</table>
				<Tabs
					tabs={[
						{
							label: 'Listings',
							content: (
								<ProductsCatalog userId={userId} />
							),
						},
						{
							label: 'Reviews',
							content: (
								<div className="filter-panel mb-24">
									{isReviewsLoading ? (
										<CircularProgress />
									) : hasReviewsError ? (
										<div className="py-4 text-center text-red-500">
											Failed to fetch reviews
										</div>
									) : (
										<Reviews
											reviews={reviews ?? []}
											userId={userId}
										/>
									)}
								</div>
							),
						},
					]}
				/>
			</div>
		</div>
	)
}

export default SellerAccount
