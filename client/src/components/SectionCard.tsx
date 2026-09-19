type SectionCardProps = {
	title: string
	description?: React.ReactNode
	action?: React.ReactNode
	children: React.ReactNode
	className?: string
}

function SectionCard({
	title,
	description,
	action,
	children,
	className,
}: SectionCardProps) {
	return (
		<section
			className={`rounded-sm border border-gray-200 bg-white shadow-sm ${className ?? ''}`}
		>
			<div className="flex items-start justify-between gap-3 border-b border-gray-200 bg-gray-100 px-4 py-3">
				<div>
					<h2 className="text-sm font-semibold text-gray-800">{title}</h2>
					{description ? (
						<div className="mt-1 text-xs text-gray-500">{description}</div>
					) : null}
				</div>
				{action}
			</div>
			<div className="p-4">{children}</div>
		</section>
	)
}

export default SectionCard
