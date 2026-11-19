'use client'

import ProductsCatalog from '@/components/ProductsCatalog'
import { useMe } from '@/hooks/useMe'

function Auctions() {
	const { me } = useMe()
	const userId = me?.data.userId ?? ''

	return (
		<ProductsCatalog
			source="auctions"
			excludeUserId={userId || undefined}
			heading="Auctions"
		/>
	)
}

export default Auctions
