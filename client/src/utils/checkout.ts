const CHECKOUT_SELECTED_IDS_KEY = 'checkoutSelectedIds'

export const saveCheckoutSelectedIds = (ids: string[]) => {
	sessionStorage.setItem(CHECKOUT_SELECTED_IDS_KEY, JSON.stringify(ids))
}

export const loadCheckoutSelectedIds = (): string[] => {
	try {
		const raw = sessionStorage.getItem(CHECKOUT_SELECTED_IDS_KEY)
		if (!raw) return []

		const parsed = JSON.parse(raw)
		return Array.isArray(parsed)
			? parsed.filter((id): id is string => typeof id === 'string')
			: []
	} catch {
		return []
	}
}

export const clearCheckoutSelectedIds = () => {
	sessionStorage.removeItem(CHECKOUT_SELECTED_IDS_KEY)
}
