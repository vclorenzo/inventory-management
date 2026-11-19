import i18nConfig from '../../i18nConfig'

const localePrefix = new RegExp(
	`^/(${i18nConfig.locales.join('|')})(?=/|$)`,
)

export function stripLocale(pathname: string) {
	const stripped = pathname.replace(localePrefix, '')
	return stripped.length > 0 ? stripped : '/'
}

export function withLocale(locale: string, href: string) {
	if (!href.startsWith('/') || href.startsWith('//')) return href

	const hashIndex = href.indexOf('#')
	const hash = hashIndex === -1 ? '' : href.slice(hashIndex)
	const pathAndQuery =
		hashIndex === -1 ? href : href.slice(0, hashIndex)
	const queryIndex = pathAndQuery.indexOf('?')
	const pathname =
		queryIndex === -1
			? pathAndQuery
			: pathAndQuery.slice(0, queryIndex)
	const search = queryIndex === -1 ? '' : pathAndQuery.slice(queryIndex)

	if (localePrefix.test(pathname)) return href

	const prefixDefault = i18nConfig.prefixDefault === true
	if (!prefixDefault && locale === i18nConfig.defaultLocale) {
		return `${pathname}${search}${hash}`
	}

	const localized =
		pathname === '/' ? `/${locale}` : `/${locale}${pathname}`

	return `${localized}${search}${hash}`
}
