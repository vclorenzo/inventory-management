'use client'

import { stripLocale, withLocale } from '@/utils/localePath'
import { useCallback } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import i18nConfig from '../../i18nConfig'

function resolveLocale(value: string | string[] | undefined) {
	const locale = Array.isArray(value) ? value[0] : value
	if (locale && i18nConfig.locales.includes(locale)) return locale
	return i18nConfig.defaultLocale
}

export function useLocalePath() {
	const params = useParams()
	const router = useRouter()
	const pathname = stripLocale(usePathname() ?? '/')
	const locale = resolveLocale(params?.locale)
	const href = useCallback(
		(path: string) => withLocale(locale, path),
		[locale],
	)
	const push = useCallback(
		(path: string) => {
			router.push(href(path))
		},
		[href, router],
	)
	const replace = useCallback(
		(path: string) => {
			router.replace(href(path))
		},
		[href, router],
	)

	return {
		locale,
		pathname,
		href,
		push,
		replace,
	}
}
