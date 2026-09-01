export function formatEndedAt(isoDate: string): string {
	return new Date(isoDate).toLocaleString('en-PH', {
		dateStyle: 'medium',
		timeStyle: 'short',
	})
}

export function formatClosingDay(isoDate: string): string {
	const end = new Date(isoDate)
	const now = new Date()
	const startOf = (d: Date) =>
		new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

	const endDay = startOf(end)
	const today = startOf(now)
	const tomorrow = startOf(
		new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
	)

	if (endDay === today) return 'Today'
	if (endDay === tomorrow) return 'Tomorrow'

	return end.toLocaleDateString()
}

export function getRemainingMs(isoDate: string, now = Date.now()): number {
	return Math.max(0, new Date(isoDate).getTime() - now)
}

export function formatCountdown(remainingMs: number): string {
	if (remainingMs <= 0) return 'Ended'

	const totalSeconds = Math.floor(remainingMs / 1000)
	const days = Math.floor(totalSeconds / 86400)
	const hours = Math.floor((totalSeconds % 86400) / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60

	const pad = (n: number) => String(n).padStart(2, '0')
	const clock = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`

	return days > 0 ? `${days}d ${clock}` : clock
}
