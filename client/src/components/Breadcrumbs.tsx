'use client'

import Link from 'next/link'

export type BreadcrumbItem = {
	label: string
	href?: string
}

type BreadcrumbsProps = {
	items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
	return (
		<nav className="flex text-sm text-gray-600" aria-label="Breadcrumb">
			<ol className="flex items-center space-x-2">
				{items.map((item, index) => {
					const isLast = index === items.length - 1

					return (
						<li key={item.label} className="flex items-center">
							{item.href && !isLast ? (
								<Link
									href={item.href}
									className="transition-colors hover:text-gray-900"
								>
									{item.label}
								</Link>
							) : (
								<span
									className={
										isLast ? 'font-medium text-gray-900' : undefined
									}
								>
									{item.label}
								</span>
							)}

							{!isLast && <span className="mx-2 text-gray-400">/</span>}
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
