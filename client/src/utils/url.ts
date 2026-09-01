export function getSafeHttpUrl(value: unknown): string | null {
	if (typeof value !== 'string') return null

	const trimmed = value.trim()
	if (!trimmed) return null

	try {
		const parsed = new URL(trimmed)
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			return null
		}
		return parsed.href
	} catch {
		return null
	}
}
