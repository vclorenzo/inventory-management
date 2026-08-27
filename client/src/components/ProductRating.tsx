import { Rating } from '@mui/material'

type ProductRatingProps = {
	rating?: number | null
	reviewCount?: number
}

function ProductRating({ rating, reviewCount = 0 }: ProductRatingProps) {
	if (typeof rating !== 'number' || reviewCount === 0) {
		return <div className="text-sm text-gray-600">Not rated</div>
	}

	return (
		<div className="flex items-center gap-2">
			<span className="text-sm font-medium text-gray-800">
				{rating.toFixed(1)}
			</span>
			<Rating
				value={rating}
				precision={0.1}
				readOnly
				size="small"
			/>
			<span className="text-sm text-gray-500">({reviewCount})</span>
		</div>
	)
}

export default ProductRating
