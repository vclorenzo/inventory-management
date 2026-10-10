import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import i18nConfig from '../../i18nConfig'

export default async function getLocale() {
	const headerList = await headers()
	const currentLocale =
		headerList.get('x-next-i18n-router-locale') ??
		i18nConfig.defaultLocale

	if (!i18nConfig.locales.includes(currentLocale)) notFound()
	return currentLocale
}
