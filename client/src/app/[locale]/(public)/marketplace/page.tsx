'use client'

import ProductsCatalog from '@/components/ProductsCatalog'
import { useMe } from '@/hooks/useMe'

function Marketplace() {
	const { me } = useMe()
	const userId = me?.data.userId ?? ''

	return (
		<ProductsCatalog
			source="marketplace"
			excludeUserId={userId || undefined}
			heading="Marketplace"
		/>
	)
}

export default Marketplace
