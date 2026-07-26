'use client'

import Header from '@/components/Header'
import PurchasesHistory from '@/components/PurchasesHistory'
import Tabs from '@/components/Tabs'

export default function History() {
	return (
		<div>
			<div className="mb-5">
				<Header name="History" />
				<p className="mb-4 text-sm text-gray-500">
					Track your bids and past purchases in one place.
				</p>
				<Tabs
					tabs={[
						{
							label: 'Bids',
							content: (
								<div className="rounded-sm border border-[#ebebeb] bg-white px-4 py-12 text-center text-sm text-gray-500">
									Your bid history will appear here.
								</div>
							),
						},
						{
							label: 'Purchases',
							content: <PurchasesHistory />,
						},
					]}
				/>
			</div>
		</div>
	)
}
