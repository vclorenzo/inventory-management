const PRODUCT_IMAGE_BASE =
	'https://s3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com'

export function getProductImageUrl(productId: string) {
	let hash = 0
	for (let i = 0; i < productId.length; i++) {
		hash = (hash * 31 + productId.charCodeAt(i)) >>> 0
	}
	const index = (hash % 3) + 1
	return `${PRODUCT_IMAGE_BASE}/product${index}.png`
}
