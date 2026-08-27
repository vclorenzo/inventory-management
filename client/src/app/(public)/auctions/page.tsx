'use client'

import ProductsCatalog from '@/components/ProductsCatalog'
import { useMe } from '@/hooks/useMe'

function Auctions() {
	const { me } = useMe()
	const userId = me?.data.userId ?? ''

	return (
		<ProductsCatalog
			listingType="auction"
			excludeUserId={userId || undefined}
			heading="Auctions"
		/>
	)
}

export default Auctions
