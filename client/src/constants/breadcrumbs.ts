import { BreadcrumbItem } from '@/components/Breadcrumbs'

const productTrail = (
	root: BreadcrumbItem,
	productName: string,
): BreadcrumbItem[] => [root, { label: 'Products' }, { label: productName }]

export const accountProductBreadcrumbs = (productName: string) =>
	productTrail({ label: 'Account', href: '/account' }, productName)

export const marketplaceProductBreadcrumbs = (productName: string) =>
	productTrail({ label: 'Marketplace', href: '/marketplace' }, productName)

export const auctionProductBreadcrumbs = (productName: string) =>
	productTrail({ label: 'Auctions', href: '/auctions' }, productName)
