import { cache } from 'react'
import { notFound } from 'next/navigation'
import { createInstance } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import getLocale from './locale'
import i18nConfig from '../../i18nConfig'

export const getTranslations = cache(async (requestedLocale?: string) => {
	const locale = requestedLocale ?? (await getLocale())

	if (!i18nConfig.locales.includes(locale)) notFound()
	const i18n = createInstance()
	await i18n
		.use(
			resourcesToBackend(
				(language: string, namespace: string) =>
					import(
						`../../public/locales/${language}/${namespace}.json`
					),
			),
		)
		.init({
			lng: locale,
			supportedLngs: i18nConfig.locales,
			fallbackLng: 'en',
			ns: ['default'],
			defaultNS: 'default',
			initAsync: false,
			interpolation: { escapeValue: false },
		})

	return { locale, t: i18n.t, resources: i18n.services.resourceStore.data }
})
