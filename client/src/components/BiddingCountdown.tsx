'use client'

import { formatCountdown, getRemainingMs } from '@/utils/dateFormatter'
import { useEffect, useState } from 'react'

function BiddingCountdown({ endsAt }: { endsAt: string }) {
	const [remainingMs, setRemainingMs] = useState(() =>
		getRemainingMs(endsAt),
	)

	useEffect(() => {
		const tick = () => {
			const remaining = getRemainingMs(endsAt)
			setRemainingMs(remaining)
			return remaining
		}

		if (tick() <= 0) return

		const id = window.setInterval(() => {
			if (tick() <= 0) window.clearInterval(id)
		}, 1000)

		return () => window.clearInterval(id)
	}, [endsAt])

	return (
		<time
			dateTime={endsAt}
			suppressHydrationWarning
			className="tabular-nums"
			title={new Date(endsAt).toLocaleString()}
		>
			{formatCountdown(remainingMs)}
		</time>
	)
}

export default BiddingCountdown
