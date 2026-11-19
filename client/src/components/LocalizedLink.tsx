'use client'

import { withLocale } from '@/utils/localePath'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { ComponentProps } from 'react'
import i18nConfig from '../../i18nConfig'

type LocalizedLinkProps = ComponentProps<typeof Link>

function resolveLocale(value: string | string[] | undefined) {
	const locale = Array.isArray(value) ? value[0] : value
	if (locale && i18nConfig.locales.includes(locale)) return locale
	return i18nConfig.defaultLocale
}

export default function LocalizedLink({
	href,
	...props
}: LocalizedLinkProps) {
	const params = useParams()
	const locale = resolveLocale(params?.locale)
	const localizedHref =
		typeof href === 'string' ? withLocale(locale, href) : href

	return <Link href={localizedHref} {...props} />
}
